# ICFPC 2021

[Official site](https://icfpcontest2021.github.io/)

## Approach

We solved problems mainly in the following two ways.

* Converting to SAT
* Manually solving with GUI

### Converting to SAT

Source code: `togatoga/solver`.

It converts problems constraints into CNF clauses and obtains solution with a SAT solver
`kissat`.

### Manually solving with GUI

Source code: `gui-tool`

This tool runs on browsers. You can move vertices in the GUI.
The tool shows constraints and dislikes. It also supports automatic transformation
of given figure.
