import { useRooms } from '../../context/RoomContext.jsx';
import { ErrorMessage, Loading } from '../ui/Feedback.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import Window from '../ui/Window.jsx';
import RoomSetupForm from './RoomSetupForm.jsx';

/**
 * 공유 공간이 있어야 쓸 수 있는 화면을 감싼다.
 * 공간이 없으면 만들기/참여 창을 대신 보여 준다.
 */
export default function RoomGate({ children }) {
  const { status, error, currentRoom, reload } = useRooms();

  if (status === 'idle' || status === 'loading') {
    return (
      <Window title="DearDays" icon={<PixelIcon name="hourglass" size={14} />}>
        <Loading label="공유 공간을 확인하는 중..." />
      </Window>
    );
  }

  if (status === 'error') {
    return (
      <Window title="공유 공간을 불러오지 못함" icon={<PixelIcon name="warning" size={14} />}>
        <ErrorMessage message={error} onRetry={reload} />
      </Window>
    );
  }

  if (!currentRoom) {
    return (
      <div className="mx-auto max-w-xl">
        <Window title="공유 공간 시작하기" icon={<PixelIcon name="folder" size={14} />} bodyClassName="p-4 sm:p-6">
          <div className="mb-5 flex items-start gap-4">
            <PixelIcon name="book" size={48} />
            <div>
              <p className="text-[18px]">아직 함께 쓰는 일기장이 없어요</p>
              <p className="font-small mt-1 text-[12px] text-muted">
                새 공간을 만들어 친구를 초대하거나, 친구에게 받은 초대 코드로 참여해 주세요.
              </p>
            </div>
          </div>
          <RoomSetupForm />
        </Window>
      </div>
    );
  }

  return children;
}
