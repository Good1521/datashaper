#
# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project.
#

from ....table_store import TableContainer
from ..verb_input import VerbInput


def replace(input: VerbInput, column: str, to: str, pattern: str, replacement: str, globalMatch=False, caseInsensitive=False):
    n = -1 if globalMatch else 1
    case = False if caseInsensitive else True
    input_table = input.get_input()
    output = input_table.copy()
    output[to] = output[column].str.replace(pat=pattern, repl=replacement, n=n, case=case)
    return TableContainer(table=output)
