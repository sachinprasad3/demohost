import { InfinitePagination } from "../../components/homework/Pagination";
import Loader from "../../components/Loader";
import {
  useGetParentAllNotification,
  useGetStudentDetails,
} from "../../services/sendNotification.services";

function GetStudentName({ studentId }) {
  const { data } = useGetStudentDetails({ studentId });

  if (!data) return <small>NA</small>;
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  return (
 
    <strong>
      {capitalize(data?.studentFirstName)} {capitalize(data?.studentLastName)}
    </strong>
  );
}

const SentNotificationList = () => {
  const {
    list: data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetParentAllNotification();

  if (error) return <span>{error.message}</span>;

  return (
    <div className="container">
      <div className="listsec syllabus-master">
        <div className="listbox studentlist theading">
          <div>S.No</div>
          <div>Student Name</div>
          <div>Notification Title</div>
          <div>Sent Status</div>
          <div>Parent Viewed</div>
        </div>
        <ul>
          {isLoading && (
            <li>
              <Loader />
            </li>
          )}
          {!isLoading && !data?.length && (
            <li>
              <div className="listbox ">No notification found</div>
            </li>
          )}

          {data?.map((st, index) => (
            <li key={st.notificationId}>
              <div className="listbox studentlist">
                <div>{index + 1} </div>
                <div data-head="Student Name">
                  <GetStudentName studentId={st.studentId} />
                </div>
                <div data-head="Notification Title">{st.notificationTitle}</div>
                <div data-head="Sent Status">{st.sentStatus}</div>
                <div data-head="Parent Viewed">
                  {st.parentViewed === "Y" ? "Seen" : "Un Seen"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* PAGINATION */}
      <InfinitePagination
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
};

export default SentNotificationList;
