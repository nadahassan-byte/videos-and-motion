import { Composition } from "remotion";
import { MasterplanSlide } from "./MasterplanSlide";
import { auraGardens, auraRidge, slideSchema } from "./slides";
import { PalmSlide } from "./PalmSlide";
import { CRESCENT, FRONDS, TRUNK } from "./palm-content";
import { PalmFlyover } from "./PalmFlyover";
import { PoolCinemagraph } from "./PoolCinemagraph";

const palm = { durationInFrames: 270, fps: 30, width: 1080, height: 1350 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PalmJumeirah-Trunk"
        component={PalmSlide}
        {...palm}
        defaultProps={TRUNK}
      />
      <Composition
        id="PalmJumeirah-Fronds"
        component={PalmSlide}
        {...palm}
        defaultProps={FRONDS}
      />
      <Composition
        id="PalmJumeirah-Crescent"
        component={PalmSlide}
        {...palm}
        defaultProps={CRESCENT}
      />

      <Composition
        id="PoolCinemagraph"
        component={PoolCinemagraph}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1350}
      />

      <Composition
        id="PalmJumeirah-Flyover3D"
        component={PalmFlyover}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1350}
      />

      <Composition
        id="AuraGardens"
        component={MasterplanSlide}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1350}
        schema={slideSchema}
        defaultProps={auraGardens}
      />
      <Composition
        id="AuraRidge"
        component={MasterplanSlide}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1350}
        schema={slideSchema}
        defaultProps={auraRidge}
      />
    </>
  );
};
