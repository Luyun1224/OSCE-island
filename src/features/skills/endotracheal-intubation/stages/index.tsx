import type { StepId } from '../caseData';
import type { StageProps } from '../ui/shared';
import { BvmStage } from './BvmStage';
import { ConfirmStage } from './ConfirmStage';
import { IntubateStage } from './IntubateStage';
import { LaryngoscopyStage } from './LaryngoscopyStage';
import { PositionStage } from './PositionStage';
import { PrepStage } from './PrepStage';
import { SecureStage } from './SecureStage';
import { TubeCareStage } from './TubeCareStage';

export function StageView({ stepId, props }: { stepId: StepId; props: StageProps }) {
  switch (stepId) {
    case 'prep':
      return <PrepStage {...props} />;
    case 'bvm':
      return <BvmStage {...props} />;
    case 'position':
      return <PositionStage {...props} />;
    case 'laryngoscopy':
      return <LaryngoscopyStage {...props} />;
    case 'intubate':
      return <IntubateStage {...props} />;
    case 'tubeCare':
      return <TubeCareStage {...props} />;
    case 'confirm':
      return <ConfirmStage {...props} />;
    case 'secure':
      return <SecureStage {...props} />;
  }
}

/** 練習階段預設的鏡頭 */
export const DEFAULT_CAMERA = { prep: 'panorama', bvm: 'airway', position: 'airway', laryngoscopy: 'laryngoscope', intubate: 'laryngoscope', tubeCare: 'airway', confirm: 'chest', secure: 'airway' } as const;
