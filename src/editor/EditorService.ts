import { BehaviorSubject } from "rxjs";

export class EditorService {

  editStageId$ = new BehaviorSubject<number>(null);

  setEditMode(stageId: number) {
    this.editStageId$.next(stageId);
  };

}

export const editorService = new EditorService();
