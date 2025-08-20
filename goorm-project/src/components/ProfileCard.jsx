export default function ProfileCard({ name, profile, intro, GitHub, blog }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
      <img src={profile} alt={name} className="w-24 h-24 rounded-full object-cover mb-3" />
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-gray-600 text-center mb-3">{intro}</p>
      <div className="flex gap-3">
        {GitHub && (
          <a
            href={GitHub}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            GitHub
          </a>
        )}
        {blog && (
          <a
            href={blog}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:underline"
          >
            Blog
          </a>
        )}
      </div>
    </div>
  )
}
