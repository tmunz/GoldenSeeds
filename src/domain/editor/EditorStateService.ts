import { BehaviorSubject } from 'rxjs';

export class EditorStateService {
  editStageId$ = new BehaviorSubject<string | null>(null);

  setEditMode(stageId: string | null) {
    this.editStageId$.next(stageId);
  }
}

export const editorStateService = new EditorStateService();
