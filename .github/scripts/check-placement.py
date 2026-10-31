#!/usr/bin/env python3
"""Checks the glass screens' placement against the canvas tables.

The app, in a screenshot run, prints one line per canvas ID it draws:
    PLACEMENT <screen> <id> <x> <y> <width> <height>
(ios/AstraAntiqua/Theme/Glass.swift, PlacementLog). The smoke script keeps each
launch's standard output in <smoke dir>/logs/*.out.txt. This script reads those
lines, checks each screen ran in a 390x844 window (the WINDOW line),
compares every rect in ios/placement/*.json to within the table's
tolerance, writes <smoke dir>/placement.md, and fails on any miss or any ID the
app did not report.

    python3 .github/scripts/check-placement.py <smoke dir> <table.json> [...]
"""
import glob
import json
import os
import sys


def measured(smoke):
    found = {}
    for path in sorted(glob.glob(os.path.join(smoke, "logs", "*.out.txt"))):
        with open(path, encoding="utf-8", errors="replace") as f:
            for line in f:
                parts = line.split()
                if len(parts) == 7 and parts[0] == "PLACEMENT":
                    found[(parts[1], parts[2])] = [float(v) for v in parts[3:]]
    return found


def main(argv):
    if len(argv) < 3:
        sys.exit(__doc__)
    smoke, tables = argv[1], argv[2:]
    found = measured(smoke)
    rows, misses = [], 0
    frame = (390.0, 844.0)
    for (screen, pid), rect in sorted(found.items()):
        if pid == "WINDOW" and (abs(rect[2] - frame[0]) > 0.5 or abs(rect[3] - frame[1]) > 0.5):
            misses += 1
            rows.append(f"| {screen} | window | 390×844 | {rect[2]:g}×{rect[3]:g} | WRONG PHONE: positions below are not comparable |")
    for table_path in tables:
        with open(table_path, encoding="utf-8") as f:
            table = json.load(f)
        tol = float(table.get("tolerance", 1.0))
        for screen, ids in table["screens"].items():
            for pid, want in ids.items():
                got = found.get((screen, pid))
                if got is None:
                    misses += 1
                    rows.append(f"| {screen} | {pid} | {fmt(want)} | not reported | MISSING |")
                    continue
                worst = max(abs(a - b) for a, b in zip(got, want))
                ok = worst <= tol
                misses += 0 if ok else 1
                rows.append(f"| {screen} | {pid} | {fmt(want)} | {fmt(got)} | {'ok' if ok else 'OFF'} {worst:.1f} |")
    report = ["| Screen | ID | Canvas | App | Result (worst difference, pt) |", "|---|---|---|---|---|", *rows]
    with open(os.path.join(smoke, "placement.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(report) + "\n")
    print("\n".join(report))
    if misses:
        sys.exit(f"{misses} placement(s) differ from the canvas by more than the tolerance, or were not reported")
    print("Every placement is within the tolerance.")


def fmt(r):
    return "{:g}, {:g} · {:g}×{:g}".format(*r)


if __name__ == "__main__":
    main(sys.argv)
