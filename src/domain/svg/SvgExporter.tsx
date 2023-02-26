import React from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';

interface Props {
  name?: string;
  getSvg: () => string | null | undefined;
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
          <AnimatedButton
            rotation={AnimatedButton.DIRECTION_DOWN}
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
      const fileName = this.props.name ?? 'default' + '.svg';
      this.exportSvgElement.download = fileName;
      this.exportSvgElement.href = URL.createObjectURL(
        new File([svg ?? ''], fileName, { type: 'image/svg+xml' }),
      );
    }
  }
}
