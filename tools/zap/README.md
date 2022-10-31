# Autogenerate files

Zap is a tool that autogenerates data model javascript and json files in the `zzz_generated` directory.

To generate these files anew, use the following process:

```
# Set the CHIP_ROOT directory to point to the CHIP SDK

export CHIP_ROOT=~/src/connectedhomeip

# Install zap packages
cd $CHIP_ROOT
git submodule update --init
cd third_party/zap/repo
npm ci

# Finally run the generation script from matternode root
./tools/zap_build_node.sh
```
