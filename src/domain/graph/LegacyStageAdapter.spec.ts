import { Stage } from '../config/Stage';
import { CartesianGrid } from '../generator/cartesian';
import { Shape } from '../generator/shape';
import { SvgGeneratorService, svgGeneratorService } from '../generator/SvgGeneratorService';
import { GraphEvaluator } from './GraphEvaluator';
import { stagesToGraph, LEGACY_STAGE_PORTS } from './LegacyStageAdapter';

describe('LegacyStageAdapter', () => {
  test('graph evaluation matches the existing linear stage pipeline result', async () => {
    const cartesianStage = await new Stage('cartesian-1').with(new CartesianGrid());
    const shapeStage = await new Stage('shape-1').with(new Shape());
    const stages = [cartesianStage, shapeStage];

    // existing linear pipeline (mirrors SvgService.generateSvg)
    const expectedCartesianResult = svgGeneratorService.getResult(cartesianStage, SvgGeneratorService.DEFAULT_RESULT);
    const expectedShapeResult = svgGeneratorService.getResult(shapeStage, expectedCartesianResult);

    const graph = stagesToGraph(stages);
    const { order, outputsByNode } = new GraphEvaluator().evaluate(graph);

    expect(order).toEqual(['cartesian-1', 'shape-1']);

    expect(outputsByNode['cartesian-1'][LEGACY_STAGE_PORTS.GRID_PORT]).toEqual({ type: 'grid', value: expectedCartesianResult.grid });
    expect(outputsByNode['cartesian-1'][LEGACY_STAGE_PORTS.SVG_PORT]).toEqual({ type: 'svg', value: expectedCartesianResult.svg });
    expect(outputsByNode['cartesian-1'][LEGACY_STAGE_PORTS.BOUNDING_BOX_PORT]).toEqual({ type: 'boundingBox', value: expectedCartesianResult.boundingBox });

    expect(outputsByNode['shape-1'][LEGACY_STAGE_PORTS.GRID_PORT]).toEqual({ type: 'grid', value: expectedShapeResult.grid });
    expect(outputsByNode['shape-1'][LEGACY_STAGE_PORTS.SVG_PORT]).toEqual({ type: 'svg', value: expectedShapeResult.svg });
    expect(outputsByNode['shape-1'][LEGACY_STAGE_PORTS.BOUNDING_BOX_PORT]).toEqual({ type: 'boundingBox', value: expectedShapeResult.boundingBox });
  });

  test('first stage with no incoming edge falls back to the default result', async () => {
    const onlyStage = await new Stage('only-1').with(new CartesianGrid());
    const graph = stagesToGraph([onlyStage]);

    const { outputsByNode } = new GraphEvaluator().evaluate(graph);
    const expected = svgGeneratorService.getResult(onlyStage, SvgGeneratorService.DEFAULT_RESULT);

    expect(outputsByNode['only-1'][LEGACY_STAGE_PORTS.GRID_PORT]).toEqual({ type: 'grid', value: expected.grid });
    expect(outputsByNode['only-1'][LEGACY_STAGE_PORTS.SVG_PORT]).toEqual({ type: 'svg', value: expected.svg });
    expect(outputsByNode['only-1'][LEGACY_STAGE_PORTS.BOUNDING_BOX_PORT]).toEqual({ type: 'boundingBox', value: expected.boundingBox });
  });
});
