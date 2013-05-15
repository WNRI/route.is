#!/bin/bash
# Waymarked Trails update script
# Make change file, will only fetch one day from current state
osmosis --rri --simc --wxc
# Import changes
echo "truncate node_changeset; truncate way_changeset; truncate relation_changeset;" | psql -d norway
osgende-import -d norway -m 10000000 -t /tmp change.osc
cd ../db/src/
python makedb.py -j 4 -d norway hiking update
# Write timestamp
grep timestamp ../../osmdiffs/state.txt | sed 's:timestamp=::;s:\\::g' > ../../last_update
