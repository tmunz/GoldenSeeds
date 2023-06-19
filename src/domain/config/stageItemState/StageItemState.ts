export interface StageItemState<G, S> {
  
  getValue(): G;
  setValue(v: S): void;

  getTextValue(): string;
  setTextValue(s: string): Promise<void>;

  isValid(): boolean;

}
