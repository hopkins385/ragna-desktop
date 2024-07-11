import type { FeatureExtractionPipelineType } from '@xenova/transformers';
import { pipeline, env, PipelineType } from '@xenova/transformers';
import { getDataPath } from '../utils/path';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

export class PipelineSingleton {
  static task: PipelineType = 'feature-extraction';
  static model_name_or_path = 'Xenova/all-MiniLM-L6-v2';
  static quantized = false;

  static instance: FeatureExtractionPipelineType;
  static model_buffer = null;
  static tokenizer = null;

  static async getInstance(progress_callback?: Function) {
    // env.allowLocalModels = false; //this is a must and if it's true by default for the first time, wrong data is cached to keep failing after this line is added, until the cache is cleared in browser!
    const dataPath = getDataPath();
    env.localModelPath = join(dataPath, 'models');
    env.cacheDir = join(dataPath, 'cache');

    if (!this.instance) {
      if (is.dev) {
        console.log(env);
        console.log('wasm path: ', env.backends.onnx.wasm.wasmPaths);
      }
      // @returns {Promise<AllTasks[T]>} A Pipeline object for the specified task.
      this.instance = pipeline(this.task, this.model_name_or_path, {
        quantized: this.quantized,
        progress_callback /*more options: https://huggingface.co/docs/transformers.js/api/utils/hub#module_utils/hub..PretrainedOptions*/
      });
    }

    return this.instance;
  }
}
