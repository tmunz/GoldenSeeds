import React from 'react';
import { DirectionButton, Direction } from '../../ui/DirectionButton';

interface Props {
  name: string;
  getSvg: () => SVGSVGElement | null;
}

export class SvgExporter extends React.Component<Props> {
  private exportSvgElement: HTMLAnchorElement | null = null;

  render() {
    return (
      <div>
        <a
          target="_blank"
          ref={(e) => (this.exportSvgElement = e)}
          onClick={() => this.exportSvg()}
        >
          <DirectionButton
            direction={Direction.DOWN}
            title="save"
            iconText="svg"
          />
        </a>
      </div>
    );
  }

  private exportSvg() {
    const svg = this.props.getSvg();
    if (this.exportSvgElement) {
      this.exportSvgElement.download = this.props.name + '.svg';
      this.exportSvgElement.href = URL.createObjectURL(
        new File([svg ? svg.outerHTML : ''], this.props.name + '.svg', {
          type: 'image/svg+xml',
        }),
      );
    }
  }
}
