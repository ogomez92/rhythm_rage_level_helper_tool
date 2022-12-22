import Panner from "@lib/sound/effects/panner";
import Gain from "@lib/sound/effects/gain";
import EffectType from "@lib/sound/enums/effect_type";
import Effect from "@lib/sound/interfaces/effect";
import Reverb from "./reverb";

export default class EffectProvider {
  private context: AudioContext;

  constructor(context: AudioContext) {
    this.context = context;
  }
  public createEffect = (type: EffectType): Effect => {
    switch (type) {
      case EffectType.PANNER:
        return new Panner(this.context);
      case EffectType.GAIN:
        return new Gain(this.context);
      case EffectType.REVERB:
        return new Reverb(this.context);
    }
  };
}
