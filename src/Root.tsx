import { Composition } from "remotion";
import { MasterplanSlide } from "./MasterplanSlide";
import { auraGardens, auraRidge, slideSchema } from "./slides";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
