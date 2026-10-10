# Web models

Derived from the original CAD exports in the sibling robot, study and fusion directories. Originals are preserved. These files are requested only after the visitor activates a model.

Generated with gltfpack 1.3.0, `-cc -kn -ce ext`. Robot and study additionally use `-si 0.5 -se 0.001` to reduce geometry with a maximum simplification error of 0.1%. Named nodes are retained for component inspection. The local Three.js loader includes MeshoptDecoder.

| Model | Original bytes | Web bytes |
| --- | ---: | ---: |
| DECODE Simple Bot | 27,488,440 | 1,698,136 |
| 3209 Mechanical Study | 55,768,072 | 2,837,796 |
| Main Assembly | 239,592 | 40,984 |
| Kicker Insert | 885,232 | 194,384 |

Static transparent previews in `public/images/` are rendered from these real models by `tools/render-model-previews.cjs`.
