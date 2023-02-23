import { BehaviorSubject } from 'rxjs';

export class EditorStateService {
  editStageId$ = new BehaviorSubject<number | null>(null);

  setEditMode(stageId: number | null) {
    this.editStageId$.next(stageId);
  }
}

export const editorStateService = new EditorStateService();
