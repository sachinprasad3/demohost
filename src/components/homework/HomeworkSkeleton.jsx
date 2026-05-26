import {
  SkeletonBox,
  SkeletonLine,
  SkeletonTable,
} from "../SkeletonComponents";

export const HomeworkViewSkeleton = () => {
  return (
    <div className="container">
      <SkeletonBox title="Class & Academic Information" rows={6} />
      <SkeletonBox title="Homework Information" rows={3} />

      <div className="whitebox">
        <h3>Visibility & Status</h3>
        <div className="formbox searchsec">
          <ul>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <SkeletonLine width="40%" />
                <SkeletonLine width="30%" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SkeletonTable />
    </div>
  );
};
