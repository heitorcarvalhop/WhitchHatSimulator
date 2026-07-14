export type ToastKind = 'discovery' | 'combination' | 'levelup' | 'challenge' | 'info' | 'warning';

export interface AppToast {
  id: string;
  kind: ToastKind;
  title: string;
  message: string;
}
