// One <Composition> per episode. Add new episodes here (2D and 3D, 16:9 and 9:16).
import React from 'react';
import {Composition} from 'remotion';
import {Example, EX_FPS, EX_SEC} from './toon/episodes/Example';
import {Example3D} from './toon/episodes/Example3D';
import {Case01, C1_FPS, C1_SEC} from './toon/episodes/Case01';
import {StyleFrames} from './toon/episodes/StyleFrames';
import {Kurier, KU_FPS, KU_SEC} from './toon/episodes/Kurier';
import {Kurier2, K2_FPS, K2_SEC} from './toon/episodes/Kurier2';
import {BinanceHeist, HE_FPS, HE_SEC} from './toon/episodes/BinanceHeist';
import {Vnutri1, VN1_FPS, VN1_SEC} from './toon/episodes/Vnutri1';
import {Vnutri2, VN2_FPS, VN2_SEC} from './toon/episodes/Vnutri2';
import {Vnutri3, VN3_FPS, VN3_SEC} from './toon/episodes/Vnutri3';
import {VnutriCover1, VnutriCover2, VnutriCover3, VnutriEndCard} from './toon/episodes/VnutriCovers';
import {AvatarKeyhole, AvatarEye} from './toon/case/Covers';
import {StickExample, StickPoses, InfoCards, SX_FPS, SX_SEC} from './toon/episodes/StickExample';

export const Root: React.FC = () => (
  <>
    <Composition id="Example" component={Example} width={1920} height={1080} fps={EX_FPS} durationInFrames={Math.round(EX_SEC * EX_FPS)} defaultProps={{vertical: false}} />
    <Composition id="ExampleVertical" component={Example} width={1080} height={1920} fps={EX_FPS} durationInFrames={Math.round(EX_SEC * EX_FPS)} defaultProps={{vertical: true}} />
    <Composition id="Example3D" component={Example3D} width={1920} height={1080} fps={EX_FPS} durationInFrames={Math.round(EX_SEC * EX_FPS)} />
    <Composition id="StickExample" component={StickExample} width={1920} height={1080} fps={SX_FPS} durationInFrames={Math.round(SX_SEC * SX_FPS)} />
    <Composition id="StickPoses" component={StickPoses} width={1920} height={1080} fps={30} durationInFrames={30} />
    <Composition id="InfoCards" component={InfoCards} width={1920} height={1080} fps={30} durationInFrames={240} />
    <Composition id="Case01" component={Case01} width={1080} height={1920} fps={C1_FPS} durationInFrames={Math.round(C1_SEC * C1_FPS)} defaultProps={{audio: true}} />
    <Composition id="Case01Safe" component={Case01} width={1080} height={1920} fps={C1_FPS} durationInFrames={Math.round(C1_SEC * C1_FPS)} defaultProps={{audio: false, safe: true}} />
    <Composition id="StyleFrames" component={StyleFrames} width={1080} height={1920} fps={30} durationInFrames={180} defaultProps={{safe: false}} />
    <Composition id="StyleFramesSafe" component={StyleFrames} width={1080} height={1920} fps={30} durationInFrames={180} defaultProps={{safe: true}} />
    <Composition id="Kurier" component={Kurier} width={1080} height={1920} fps={KU_FPS} durationInFrames={Math.round(KU_SEC * KU_FPS)} defaultProps={{audio: true}} />
    <Composition id="KurierSafe" component={Kurier} width={1080} height={1920} fps={KU_FPS} durationInFrames={Math.round(KU_SEC * KU_FPS)} defaultProps={{audio: false, safe: true}} />
    <Composition id="Kurier2" component={Kurier2} width={1080} height={1920} fps={K2_FPS} durationInFrames={Math.round(K2_SEC * K2_FPS)} defaultProps={{audio: true}} />
    <Composition id="Kurier2Safe" component={Kurier2} width={1080} height={1920} fps={K2_FPS} durationInFrames={Math.round(K2_SEC * K2_FPS)} defaultProps={{audio: false, safe: true}} />
    <Composition id="BinanceHeist" component={BinanceHeist} width={1080} height={1920} fps={HE_FPS} durationInFrames={Math.round(HE_SEC * HE_FPS)} defaultProps={{audio: true}} />
    <Composition id="BinanceHeistSafe" component={BinanceHeist} width={1080} height={1920} fps={HE_FPS} durationInFrames={Math.round(HE_SEC * HE_FPS)} defaultProps={{audio: false, safe: true}} />
    <Composition id="Vnutri1" component={Vnutri1} width={1080} height={1920} fps={VN1_FPS} durationInFrames={Math.round(VN1_SEC * VN1_FPS)} defaultProps={{audio: true}} />
    <Composition id="Vnutri1Safe" component={Vnutri1} width={1080} height={1920} fps={VN1_FPS} durationInFrames={Math.round(VN1_SEC * VN1_FPS)} defaultProps={{audio: false, safe: true}} />
    <Composition id="Vnutri2" component={Vnutri2} width={1080} height={1920} fps={VN2_FPS} durationInFrames={Math.round(VN2_SEC * VN2_FPS)} defaultProps={{audio: true}} />
    <Composition id="Vnutri2Safe" component={Vnutri2} width={1080} height={1920} fps={VN2_FPS} durationInFrames={Math.round(VN2_SEC * VN2_FPS)} defaultProps={{audio: false, safe: true}} />
    <Composition id="Vnutri3" component={Vnutri3} width={1080} height={1920} fps={VN3_FPS} durationInFrames={Math.round(VN3_SEC * VN3_FPS)} defaultProps={{audio: true}} />
    <Composition id="Vnutri3Safe" component={Vnutri3} width={1080} height={1920} fps={VN3_FPS} durationInFrames={Math.round(VN3_SEC * VN3_FPS)} defaultProps={{audio: false, safe: true}} />
    <Composition id="VnutriCover1" component={VnutriCover1} width={1080} height={1920} fps={30} durationInFrames={1} />
    <Composition id="VnutriCover2" component={VnutriCover2} width={1080} height={1920} fps={30} durationInFrames={1} />
    <Composition id="VnutriCover3" component={VnutriCover3} width={1080} height={1920} fps={30} durationInFrames={1} />
    <Composition id="VnutriEndCard" component={VnutriEndCard} width={1080} height={1920} fps={30} durationInFrames={1} />
    <Composition id="AvatarKeyhole" component={AvatarKeyhole} width={1080} height={1080} fps={30} durationInFrames={1} />
    <Composition id="AvatarEye" component={AvatarEye} width={1080} height={1080} fps={30} durationInFrames={1} />
  </>
);
