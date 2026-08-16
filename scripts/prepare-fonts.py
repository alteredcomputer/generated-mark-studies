#  Derives the static faces the generator needs from the two sources committed in
#  fonts/. Its outputs are committed too, so a clone needs nothing but `pnpm
#  install` to build. Run this only when a weight or an axis value changes.
#
#      pip install fonttools brotli
#      python3 scripts/prepare-fonts.py
#
#  Python rather than .mjs because fontTools is the only instancer available; the
#  generator itself stays pure ES modules. Every step is idempotent.

import os

from fontTools import ttLib
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(os.path.dirname(HERE), "fonts")

BERKELEY = os.path.join(FONTS, "berkeley-mono-variable.woff2")
SCREEN = os.path.join(FONTS, "px", "PxGroteskScreen-Regular.otf")

#  resvg does not honour variation axes, so every weight the sheets ask for has
#  to exist as its own file. wdth 80 is the source's own "Condensed" instance;
#  it is split into a separate family because fontdb keys on family plus weight
#  alone, so a condensed 700 would otherwise collide with the normal 700.
INSTANCES = [
    ("Berkeley Mono", "BerkeleyMono", 400, 100, "Regular"),
    ("Berkeley Mono", "BerkeleyMono", 500, 100, "Medium"),
    ("Berkeley Mono", "BerkeleyMono", 600, 100, "SemiBold"),
    ("Berkeley Mono", "BerkeleyMono", 700, 100, "Bold"),
    ("Berkeley Mono", "BerkeleyMono", 800, 100, "ExtraBold"),
    ("Berkeley Mono", "BerkeleyMono", 900, 100, "Black"),
    ("Berkeley Mono Cond", "BerkeleyMonoCond", 700, 80, "Bold"),
    ("Berkeley Mono Cond", "BerkeleyMonoCond", 900, 80, "Black")
]

WINDOWS = (3, 1, 0x409)
MAC = (1, 0, 0)


def rename(font, family, style, postscript):
    """Make a face addressable as family + weight and nothing else.

    Name IDs 16/17 are dropped deliberately. A face that declares a typographic
    family registers under that name instead of ID 1, which is how a sheet
    labelled "Px Grotesk Screen" silently rendered in the fallback face.
    """

    name = font["name"]

    for platform in (WINDOWS, MAC):
        name.setName(family, 1, *platform)
        name.setName(style, 2, *platform)
        name.setName(f"{family} {style}", 4, *platform)
        name.setName(postscript, 6, *platform)

    name.names = [record for record in name.names if record.nameID not in (16, 17)]


def cut(family, prefix, weight, width, style):
    font = ttLib.TTFont(BERKELEY)

    instance = instancer.instantiateVariableFont(font, {"wght": weight, "wdth": width, "slnt": 0}, updateFontNames=False)

    instance["OS/2"].usWeightClass = weight

    rename(instance, family, style, f"{prefix}-{style}")

    #  A woff2 input keeps its compressed flavor unless it is cleared, and resvg
    #  will not read a woff2 out of a font directory.
    instance.flavor = None

    path = os.path.join(FONTS, f"{prefix}-{style}.ttf")

    instance.save(path)

    print(f"  {os.path.basename(path)}  {family} {weight} / wdth {width}")


print(f"Berkeley Mono, {len(INSTANCES)} static instances:")

for entry in INSTANCES:
    cut(*entry)

print("\nPx Grotesk Screen, name table flattened:")

screen = ttLib.TTFont(SCREEN)

rename(screen, "Px Grotesk Screen", "Regular", "PxGroteskScreen-Regular")

screen.save(SCREEN)

print(f"  {os.path.basename(SCREEN)}  Px Grotesk Screen {screen['OS/2'].usWeightClass}")
