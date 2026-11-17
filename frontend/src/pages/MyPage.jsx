import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera, FolderOpen, LogOut, Save, Trash2 } from 'lucide-react';
import { ACCEPT_ATTR, checkImageFiles } from '../components/diary/imageRules.js';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import GroupBox from '../components/ui/GroupBox.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import TextField from '../components/ui/TextField.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { userService } from '../services/userService.js';
import { daysSince, formatDateTime } from '../utils/date.js';
import { getErrorMessage } from '../utils/errors.js';

const INTRO_MAX = 300;

function StatRow({ label, value, unit }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="font-small text-[12px] text-muted">{label}</dt>
      <dd className="text-[18px]">
        {value}
        <span className="font-small ml-1 text-[12px] text-muted">{unit}</span>
      </dd>
    </div>
  );
}

export default function MyPage() {
  useDocumentTitle('내 정보');
  const { user, updateUser, logout } = useAuth();
  const { selectRoom } = useRooms();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const { data: me, loading, error, reload, setData } = useFetch(() => userService.getMyPage(), []);
  const [form, setForm] = useState({ nickname: '', introduction: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (me) setForm({ nickname: me.nickname, introduction: me.introduction ?? '' });
  }, [me]);

  const applyUser = (updated) => {
    setData((prev) => ({ ...prev, ...updated }));
    updateUser(updated);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const nickname = form.nickname.trim();
    const next = {};
    if (nickname.length < 2 || nickname.length > 20) next.nickname = '닉네임은 2~20자로 정해 주세요.';
    if (form.introduction.length > INTRO_MAX) next.introduction = `자기소개는 ${INTRO_MAX}자 이하로 써 주세요.`;
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const updated = await userService.updateProfile({ nickname, introduction: form.introduction.trim() });
      applyUser(updated);
      toast.success('프로필을 저장했어요.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changePhoto = async (fileList) => {
    const { accepted, problems } = checkImageFiles([...fileList].slice(0, 1), 0);
    if (problems.length) return toast.error(problems[0]);
    if (!accepted.length) return;
    setPhotoBusy(true);
    try {
      applyUser(await userService.uploadProfileImage(accepted[0]));
      toast.success('프로필 사진을 바꿨어요.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    try {
      applyUser(await userService.removeProfileImage());
      toast.success('기본 프로필로 바꿨어요.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('로그아웃했어요. 또 만나요!');
    navigate('/login', { replace: true });
  };

  if (loading && !me) {
    return (
      <Window title="내 컴퓨터 - 속성" icon={<PixelIcon name="computer" size={14} />}>
        <Loading label="내 정보를 불러오는 중..." />
      </Window>
    );
  }
  if (error && !me) {
    return (
      <Window title="내 컴퓨터 - 속성" icon={<PixelIcon name="computer" size={14} />}>
        <ErrorMessage error={error} onRetry={reload} />
      </Window>
    );
  }

  const profile = me ?? user;

  return (
    <div className="mx-auto max-w-4xl">
      <Window
        title="내 컴퓨터 - 속성"
        icon={<PixelIcon name="computer" size={14} />}
        onClose={() => navigate('/')}
        closeLabel="홈으로"
        statusBar={
          <>
            <span className="flex-1">{formatDateTime(profile.createdAt)} 가입</span>
            <span>DearDays와 {daysSince(profile.createdAt)}일째</span>
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-3 text-center">
            <Avatar user={profile} size={128} />
            <div>
              <p className="text-[18px]">{profile.nickname}</p>
              <p className="font-small break-all text-[12px] text-muted">{profile.email}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => fileRef.current?.click()} loading={photoBusy} icon={<Camera size={12} />}>
                사진 바꾸기
              </Button>
              {profile.profileImage && (
                <Button size="sm" onClick={removePhoto} disabled={photoBusy} icon={<Trash2 size={12} />}>
                  기본 이미지로
                </Button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT_ATTR}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                changePhoto(e.target.files ?? []);
                e.target.value = '';
              }}
            />
            <p className="font-small text-[12px] text-muted">JPG, PNG, GIF, WEBP 파일을 5MB까지</p>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <GroupBox title="프로필">
              <form onSubmit={saveProfile} noValidate className="flex flex-col gap-3">
                <TextField
                  label="닉네임"
                  value={form.nickname}
                  maxLength={20}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  error={errors.nickname}
                />
                <TextField
                  as="textarea"
                  label="자기소개"
                  value={form.introduction}
                  maxLength={INTRO_MAX}
                  rows={3}
                  inputClassName="ink resize-y text-[15px]"
                  placeholder="친구에게 보여 줄 한두 줄 소개"
                  onChange={(e) => setForm((f) => ({ ...f, introduction: e.target.value }))}
                  error={errors.introduction}
                  hint={`${form.introduction.length}/${INTRO_MAX}`}
                />
                <TextField label="이메일" value={profile.email} readOnly hint="이메일은 바꿀 수 없어요." />
                <div className="flex justify-end">
                  <Button type="submit" variant="default" loading={saving} icon={!saving && <Save size={14} />}>
                    프로필 저장
                  </Button>
                </div>
              </form>
            </GroupBox>

            <GroupBox title="일기 통계">
              <dl className="grid gap-x-6 sm:grid-cols-2">
                <StatRow label="내가 쓴 일기" value={me.stats.diaryCount} unit="편" />
                <StatRow label="받은 공감" value={me.stats.likesReceived} unit="개" />
                <StatRow label="남긴 댓글" value={me.stats.commentsWritten} unit="개" />
                <StatRow label="끝낸 할 일" value={me.stats.todosDone ?? 0} unit="개" />
                <StatRow label="참여한 공간" value={me.stats.roomCount} unit="곳" />
              </dl>
            </GroupBox>

            <GroupBox title="공유 공간">
              {me.rooms.length === 0 ? (
                <p className="font-small text-[12px] text-muted">아직 참여한 공간이 없어요. 홈에서 공간을 만들거나 초대 코드로 참여해 보세요.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {me.rooms.map((room) => {
                    const partner = room.members.find((m) => m.id !== profile.id);
                    return (
                      <li key={room.id} className="flex flex-wrap items-center gap-3 bg-hilite px-3 py-2 shadow-[var(--bevel-thin-in)]">
                        <PixelIcon name="book" size={24} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate">{room.name}</p>
                          <p className="font-small text-[12px] text-muted">
                            {partner ? `${partner.nickname}님과 함께` : '친구를 기다리는 중'}, 일기 {room.diaryCount}편
                          </p>
                        </div>
                        <Button
                          size="sm"
                          icon={<FolderOpen size={12} />}
                          onClick={() => {
                            selectRoom(room.id);
                            navigate('/room');
                          }}
                        >
                          열기
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </GroupBox>

            <div className="flex justify-end">
              <Button onClick={() => setConfirmLogout(true)} icon={<LogOut size={14} />}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </Window>

      <ConfirmDialog
        open={confirmLogout}
        title="로그아웃"
        message="DearDays에서 로그아웃할까요?"
        confirmLabel="로그아웃"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
