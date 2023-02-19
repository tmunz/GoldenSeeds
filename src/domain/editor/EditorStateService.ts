import { BehaviorSubject } from 'rxjs';

export class EditorStateService {
  editStageId$ = new BehaviorSubject<number>(null);

  setEditMode(stageId: number) {
    this.editStageId$.next(stageId);
  }
}

export const editorStateService = new EditorStateService();
