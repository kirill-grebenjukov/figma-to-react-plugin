import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './ui.css';

// declare function require(path: string): any;

const defaultState = {
  id: null,
  name: 'none',
  dontExport: false,
  skipChildren: false,
  fullWidth: false,
  fullHeight: false,
  componentName: '',
  componentPath: '',
  exportAs: 'class',
  extendMode: 'none',
  extendImport: '',
  extendComponent: '',
  extendProps: '',
  hocImport: '',
  hocCode: '',
};

class App extends React.Component {
  state = {
    ...defaultState,
  };

  componentDidMount() {
    window.onmessage = event => {
      const {
        data: {
          pluginMessage: { type, settings },
        },
      } = event;

      if (type === 'selectionChange') {
        const {
          extend: {
            mode: extendMode,
            import: extendImport,
            component: extendComponent,
            props: extendProps,
          } = {
            mode: defaultState.extendMode,
            import: defaultState.extendImport,
            component: defaultState.extendImport,
            props: defaultState.extendProps,
          },
          hoc: { import: hocImport, code: hocCode } = {
            import: defaultState.hocImport,
            code: defaultState.hocCode,
          },
          ...rest
        } = settings;
        this.setState({
          ...defaultState,
          ...rest,
          extendMode,
          extendImport,
          extendComponent,
          extendProps,
          hocImport,
          hocCode,
        });
      }
    };
  }

  onChange = field => ({
    target: { type, checked = false, value: value0 },
  }) => {
    let value = value0;
    if (field === 'componentName' || field === 'extendComponent') {
      value = value0.replace(' ', '');
    }

    const { state } = this;
    const newState = {
      ...state,
      [field]: type === 'checkbox' ? checked : value,
    };

    this.setState(newState);

    parent.postMessage(
      { pluginMessage: { type: 'set-state', state: newState } },
      '*',
    );
  };

  render() {
    const {
      id,
      name = 'none',
      dontExport = false,
      skipChildren = false,
      fullWidth = false,
      fullHeight = false,
      componentName = '',
      componentPath = '',
      exportAs = 'class',
      extendMode = 'none',
      extendImport = '',
      extendComponent = '',
      extendProps = '',
      hocImport = '',
      hocCode = '',
    } = this.state;

    const disabled = id === null;
    const noExtend = extendMode === 'none';

    return (
      <div>
        <div className="title">
          <strong>Export node: {name}</strong>
        </div>
        <hr />
        <div className="line flex">
          <label className="col">
            <input
              type="checkbox"
              disabled={disabled}
              checked={dontExport}
              onChange={this.onChange('dontExport')}
            />
            Don't export
          </label>
          <label className="col">
            <input
              type="checkbox"
              disabled={disabled}
              checked={skipChildren}
              onChange={this.onChange('skipChildren')}
            />
            Skip children
          </label>
        </div>
        <div className="line">
          <label>
            Export as:&nbsp;
            <select
              disabled={disabled}
              value={exportAs}
              onChange={this.onChange('exportAs')}>
              <option value="class">class</option>
              <option value="svg">svg</option>
              <option value="png">png</option>
              <option value="jpg">jpg</option>
            </select>
          </label>
        </div>
        <div className="line">
          <label>
            Component Name:&nbsp;
            <input
              type="text"
              disabled={disabled}
              value={componentName}
              onChange={this.onChange('componentName')}
            />
          </label>
        </div>
        <div className="line">
          <label>
            Component Path:&nbsp;
            <input
              type="text"
              disabled={disabled}
              value={componentPath}
              onChange={this.onChange('componentPath')}
            />
          </label>
        </div>
        <div className="line">
          <label>
            <input
              type="checkbox"
              disabled={disabled}
              checked={fullWidth}
              onChange={this.onChange('fullWidth')}
            />
            Full width
          </label>
          &nbsp;&nbsp;
          <label>
            <input
              type="checkbox"
              disabled={disabled}
              checked={fullHeight}
              onChange={this.onChange('fullHeight')}
            />
            Full height
          </label>
        </div>
        <br />
        <hr />
        <strong>Extends</strong>
        <div className="line">
          <label>
            Mode:&nbsp;
            <select
              disabled={disabled}
              value={extendMode}
              onChange={this.onChange('extendMode')}>
              <option value="none">No</option>
              <option value="wrapWith">wrapWith</option>
              <option value="useAsRoot">useAsRoot</option>
              <option value="useInstead">useInstead</option>
            </select>
          </label>
        </div>
        <div className="line">
          <label>
            Import:
            <br />
            <textarea
              disabled={disabled || noExtend}
              value={extendImport}
              onChange={this.onChange('extendImport')}
            />
          </label>
        </div>
        <div className="line">
          <label>
            Component:
            <br />
            <input
              type="text"
              disabled={disabled || noExtend}
              value={extendComponent}
              onChange={this.onChange('extendComponent')}
            />
          </label>
        </div>
        <div className="line">
          <label>
            Props:
            <br />
            <textarea
              disabled={disabled || noExtend}
              value={extendProps}
              onChange={this.onChange('extendProps')}
            />
          </label>
        </div>
        <br />
        <hr />
        <strong>HOC</strong>
        <div className="line">
          <label>
            Import:
            <br />
            <textarea
              disabled={disabled}
              value={hocImport}
              onChange={this.onChange('hocImport')}
            />
          </label>
        </div>
        <div className="line">
          <label>
            Code:&nbsp;
            <input
              type="text"
              disabled={disabled}
              value={hocCode}
              onChange={this.onChange('hocCode')}
            />
          </label>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'));
