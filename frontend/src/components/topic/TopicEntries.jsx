import { Link } from 'react-router';
import Avatar from '../ui/Avatar.jsx';

/**
 * 주제 하나에 공간 사람들이 쓴 글. 멤버마다 썼는지 아직인지 보여 준다.
 * members: 공간 멤버, entries: [{ id, title, author, isMine }]
 */
export default function TopicEntries({ members, entries }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {members.map((member) => {
        const written = entries.filter((entry) => entry.author?.id === member.id);
        return (
          <li key={member.id} className="flex min-w-0 items-center gap-2 text-[13px]">
            <Avatar user={member} size={20} />
            <span className="shrink-0">{member.nickname}</span>
            {written.length > 0 ? (
              <span className="flex min-w-0 flex-wrap gap-x-2">
                {written.map((entry) => (
                  <Link key={entry.id} to={`/diaries/${entry.id}`} className="ink truncate text-[14px]">
                    「{entry.title}」
                  </Link>
                ))}
              </span>
            ) : (
              <span className="font-small text-[12px] text-muted">아직 안 썼어요</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
