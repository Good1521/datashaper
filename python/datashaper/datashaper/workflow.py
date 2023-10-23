#
# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project.
#
"""The graph module contains the graph classes used by the datashaper."""

import inspect
import json
import os
import time

from collections import OrderedDict, defaultdict
from typing import Any, Callable, Generic, Optional, Set, TypeVar
from uuid import uuid4

import pandas as pd

from jsonschema import validate as validate_schema

from .engine import Verb, VerbInput, functions
from .execution import ExecutionNode, VerbDefinitions, VerbTiming, noop
from .progress import (
    ProgressStatus,
    StatusReportHandler,
    VerbStatusReporter,
    create_progress_reporter,
)
from .table_store import Table, TableContainer


# TODO: this won't work for a published package
SCHEMA_FILE = "../../schema/workflow.json"

Context = TypeVar("Context")


class Workflow(Generic[Context]):
    """A data processing graph."""

    schema: dict[str, Any]
    inputs: dict[str, TableContainer] = {}
    __graph: dict[str, ExecutionNode] = OrderedDict()
    __dependency_graph: dict[str, set] = defaultdict(set)
    __last_step_id: str = None

    depends_on: Set[str]
    """Externals that this workflow depends on"""

    def __init__(
        self,
        schema: dict[str, Any],
        input_path: Optional[str] = None,
        input_tables: Optional[dict[str, pd.DataFrame]] = None,
        schema_path: Optional[str] = SCHEMA_FILE,
        verbs: Optional[dict[str, Callable]] = functions,
        # TODO: the current schema definition does not work in Python
        validate: bool = False,
        default_input: Optional[str] = "datasource",
    ):
        """Create an execution graph from the Dict provided in workflow.

        :param schema: the Dict object that contains the workflow
        :type schema: Dict
        :param input_path: Optional input path, if provided input
                           tables will be loaded relative to that path, defaults to None
        :type input_path: str, optional
        :param schema_path: Optional Workflow schema path, if provided input
                           tables will be loaded relative to that path, defaults to
                           a known JSON schema path.
        :type schema_path: str, optional
        :param validate: Optional value, if true perform JSON-schema validation.
                         Defaults to False.
        :type validate: bool, optional

        :param default_input: Optional value, the default input for the first step.
        :type default_input: str, optional
        """
        self._schema = schema
        self.depends_on = self._get_depends_on()

        # Perform JSON-schema validation
        if validate and schema_path is not None:
            with open(schema_path) as schema_file:
                schema_json = json.load(schema_file)
                validate_schema(schema, schema_json)

        # Auto-load input tables if provided.
        if input_path is not None:
            for input in schema["input"]:
                # TODO: support other file formats
                csv_table = pd.read_csv(os.path.join(input_path, f"{input}.csv"))
                self.add_table(input, csv_table)

        if input_tables is not None:
            for input, table in input_tables.items():
                self.add_table(input, table)

        # Create the execution graph
        previous_step_id = None
        for step in schema["steps"]:
            step_id = step["id"] if "id" in step else str(uuid4())
            step_input = (
                step["input"] if "input" in step else previous_step_id
            ) or default_input
            verb_fn = Workflow.__get_verb_fn(step["verb"], verbs)

            step = ExecutionNode(
                node_id=step_id,
                node_input=step_input,
                verb=verb_fn,
                args=step["args"] if "args" in step else {},
            )
            self.__graph[step_id] = step
            for input in Workflow.__inputs_list(step_input):
                self.__dependency_graph[input].add(step_id)
            previous_step_id = step.node_id

        self.__last_step_id = previous_step_id

    @property
    def name(self) -> str:
        """Get the name of the workflow, inferred from the schema json input."""
        return self._schema.get("name", "Workflow")

    def _get_depends_on(self) -> Set[str]:
        depends_on: set[str] = set()
        known: set[str] = set()

        for step in self._schema["steps"]:
            if "id" in step:
                known.add(step["id"])

            if "input" in step:
                step_input = step["input"]
                if isinstance(step_input, str):
                    depends_on.add(step_input)
                else:
                    depends_on.add(step_input["source"])
                    if "others" in step_input:
                        for e in step_input["others"]:
                            depends_on.add(e)
                    if "depends_on" in step_input:
                        for e in step_input["depends_on"]:
                            depends_on.add(e)

        # Remove known steps from dep list
        return depends_on.difference(known)

    @staticmethod
    def __inputs_list(input):
        if isinstance(input, str):
            return [input]
        else:
            inputs = []
            for value in input.values():
                if isinstance(value, str):
                    inputs.append(value)
                else:
                    inputs.extend(value)
            return inputs

    @staticmethod
    def __get_verb_fn(verb: str, verbs: Optional[VerbDefinitions]) -> Callable:
        """Get the verb function from the name."""
        try:
            # try to find a built-in verb
            return functions[Verb(verb)]
        except ValueError:
            # try to use a custom verb
            if verbs is None or verb not in verbs:
                raise ValueError(f"Verb {verb} not found in verbs")
            return verbs[verb]

    @staticmethod
    def __resolve_run_context(
        exec_node: ExecutionNode,
        context: Optional[Context],
        reporter: VerbStatusReporter,
    ) -> dict[str, Any]:
        """Injects the run context into the workflow steps."""

        def argument_names(fn):
            return inspect.getfullargspec(fn).args

        verb_args = argument_names(exec_node.verb)
        run_ctx: dict[str, Any] = {}

        # Pass in the top-level context
        if "context" in verb_args and "context" not in exec_node.args:
            run_ctx["context"] = context

        # Pass in the verb reporter
        if "reporter" in verb_args and "reporter" not in exec_node.args:
            run_ctx["reporter"] = reporter

        # Pass in individual context items
        if context is not None:
            for context_key in dir(context):
                if context_key in verb_args and context_key not in exec_node.args:
                    run_ctx[context_key] = getattr(context, context_key)

        return run_ctx

    def _check_inputs(self, node_key, visited):
        node = self.__graph[node_key]
        return all(
            [
                input in visited or input in self.inputs
                for input in Workflow.__inputs_list(node.node_input)
            ]
        )

    def _resolve_inputs(self, inputs):
        if isinstance(inputs, str):
            return {
                "input": VerbInput(
                    input=self.inputs[inputs]
                    if inputs in self.inputs
                    else self.__graph[inputs].result
                )
            }
        else:
            input_mapping = {}
            for key, value in inputs.items():
                if isinstance(value, str):
                    input_mapping[key] = (
                        self.inputs[value]
                        if value in self.inputs
                        else self.__graph[value].result
                    )
                else:
                    input_mapping[key] = [
                        self.inputs[input]
                        if input in self.inputs
                        else self.__graph[input].result
                        for input in value
                    ]
            return {"input": VerbInput(**input_mapping)}

    def add_table(self, id: str, table: pd.DataFrame) -> None:
        """Add a dataframe to the graph with a given id."""
        self.inputs[id] = TableContainer(table=table)

    def output(self, id: Optional[str] = None) -> Table:
        """Get a dataframe from the graph by id."""
        if id is None:
            id = self.__last_step_id

        container: Optional[TableContainer] = self.__graph[id].result
        if container is None:
            raise Exception(
                f"Value not {self.name}: {self.__graph[id].verb.__name__} calculated yet."
            )
        else:
            return container.table

    def run(
        self, context: Context = None, on_progress: StatusReportHandler = noop
    ) -> VerbTiming:
        """Run the execution graph."""
        visited: Set[str] = set()
        executable_nodes = []
        verb_timing: VerbTiming = {}

        for node_key in self.__graph.keys():
            if self._check_inputs(node_key, visited):
                executable_nodes.append(node_key)

        wf_progress = create_progress_reporter(
            f"Workflow: {self.name}", transient=False
        )
        verb_idx = 0

        while len(executable_nodes) > 0:
            current_id = executable_nodes.pop(0)
            executable_node = self.__graph[current_id]
            verb_name = executable_node.verb.__name__

            # set up verb progress reporter
            progress = create_progress_reporter(f"verb: {verb_name}", wf_progress)
            verb_reporter = VerbStatusReporter(
                f"{self.name}.{verb_name}.{verb_idx}", on_progress, progress
            )
            progress(ProgressStatus(progress=0))
            start_verb_time = time.time()

            # execute the verb
            result = executable_node.verb(
                **executable_node.args,
                **self._resolve_inputs(executable_node.node_input),
                **Workflow.__resolve_run_context(
                    executable_node, context, verb_reporter
                ),
            )

            # record the verb timing and report progress
            verb_timing[f"verb_{verb_name}_{verb_idx}"] = time.time() - start_verb_time
            progress(ProgressStatus(progress=1))
            executable_node.result = result

            # move to the next verb
            visited.add(current_id)
            for possible in self.__dependency_graph[current_id]:
                if self._check_inputs(possible, visited):
                    executable_nodes.append(possible)
            verb_idx += 1

        for node in self.__graph.keys():
            if node not in visited:
                if not self._check_inputs(node, visited):
                    raise ValueError(f"Missing inputs for node {node}!")

    def export(self):
        """Export the graph into a workflow JSON object."""
        return {
            "input": [input_name for input_name in self.inputs.keys()],
            "steps": [
                {
                    "id": step.node_id,
                    "verb": step.verb.__name__,
                    "input": step.node_input,
                    "args": step.args,
                }
                for step in self.__graph.values()
            ],
        }
