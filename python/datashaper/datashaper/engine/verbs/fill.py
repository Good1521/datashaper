#
# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project.
#

from typing import Union

from datashaper.engine.verbs.verb_input import VerbInput
from datashaper.engine.verbs.verbs_mapping import verb
from datashaper.table_store import TableContainer


@verb(name="fill")
def fill(
    input: VerbInput,
    to: str,
    value: Union[str, int, float, bool],
):
    input_table = input.get_input()
    output = input_table
    output[to] = value
    return TableContainer(table=output)
