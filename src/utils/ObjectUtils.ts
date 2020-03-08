export interface Patch {
  path: string[];
  value: any;
}

export class ObjectUtils {

  static merge<T>(source: T, patch: Patch): T {
    return ObjectUtils.patch(
      source,
      ObjectUtils.convertPatchToObject(patch)
    );
  }

  static set<T>(source: T, patch: Patch): T {
    return patch.path.length === 0
      ? ObjectUtils.deepCopy(patch.value)
      : ObjectUtils.patch(
        source,
        ObjectUtils.convertPatchToObject({ path: patch.path, value: undefined }),
        ObjectUtils.convertPatchToObject(patch)
      );
  }

  static patch<T>(source: T, ...patches: any[]): T {
    const isArray = Array.isArray(source);
    const copy = isArray ? [...(source as unknown as any[])] : { ...source }
    return ObjectUtils.apply(isArray, copy, patches)
  }

  static deepCopy<T>(obj: T): T {
    return ObjectUtils.patch({} as T, obj);
  }

  private static convertPatchToObject(patch: Patch) {
    let current: any = patch.value;
    let path: string[] = [...patch.path];
    let key: string;
    while (key = path.pop()) {
      current = { [key]: current };
    }
    return current;
  };

  private static apply<T>(isArray: boolean, copy: any, patch: any): T {
    if (patch && typeof patch === 'object') {
      if (Array.isArray(patch)) {
        patch.forEach(p => copy = ObjectUtils.apply(isArray, copy, p));
      }
      else {
        Object.keys(patch).forEach((k: string | number) => {
          const val = patch[k]
          if (typeof val === 'function') {
            copy[k] = val;
          }
          else if (typeof val === 'undefined') {
            isArray && isFinite(k as any) ? copy.splice(k, 1) : delete copy[k];
          }
          else if (val === null || typeof val !== 'object' || Array.isArray(val)) {
            copy[k] = val;
          }
          else if (typeof copy[k] === 'object') {
            copy[k] = val === copy[k] ? val : ObjectUtils.patch(copy[k], val);
          }
          else {
            copy[k] = ObjectUtils.apply(false, {}, val);
          }
        });
      }
    } else if (typeof patch === 'function') {
      copy = patch(copy, ObjectUtils.patch);
    }
    return copy;
  }
}