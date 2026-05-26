export const SkeletonLine = ({ width = "100%", height = 16 }) => (
  <div
    className="bg-secondary bg-opacity-25 rounded mb-2"
    style={{
      width,
      height,
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

export const SkeletonBox = ({ title, rows = 4 }) => (
  <div className="whitebox">
    <h3>{title}</h3>

    <div className="formbox searchsec">
      <ul>
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i}>
            <SkeletonLine width="40%" height={14} />
            <SkeletonLine width="70%" height={16} />
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export const SkeletonTable = () => (
  <div className="whitebox">
    <h3>Attachments</h3>

    <div className="table-responsive">
      <table className="table table-bordered align-middle mb-0">
        <thead className="table-light">
          <tr>
            {Array.from({ length: 7 }).map((_, i) => (
              <th key={i}>
                <SkeletonLine height={14} />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 3 }).map((_, row) => (
            <tr key={row}>
              {Array.from({ length: 7 }).map((_, col) => (
                <td key={col}>
                  <SkeletonLine />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
