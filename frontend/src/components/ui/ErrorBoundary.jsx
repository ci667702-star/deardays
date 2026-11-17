import { Component } from 'react';
import PixelIcon from './PixelIcon.jsx';
import Window from './Window.jsx';

/** 화면을 그리다 오류가 나도 앱 전체가 하얗게 사라지지 않도록, 옛 오류 창으로 대신 보여 준다. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[DearDays] 화면 오류', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-md py-10">
        <Window title="DearDays - 오류" icon={<PixelIcon name="warning" size={14} />} collapsible={false} maximizable={false}>
          <div className="flex items-start gap-4">
            <PixelIcon name="warning" size={32} />
            <div>
              <p>화면을 그리는 중에 문제가 생겼어요.</p>
              <p className="font-small mt-1 text-[12px] text-muted">다시 불러오면 대부분 해결돼요. 작성 중이던 내용은 저장되지 않았을 수 있어요.</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="btn btn--default" onClick={() => window.location.reload()}>
              다시 불러오기
            </button>
            <button type="button" className="btn" onClick={() => window.location.assign('/')}>
              홈으로
            </button>
          </div>
        </Window>
      </div>
    );
  }
}
