import React, { useEffect, useState } from "react";

interface Course {
  course_id: number;
  course_name: string;
  course_link: string;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const token = "YOUR_BEARER_TOKEN_HERE"; // Replace with your JWT

  // Extract YouTube video ID for thumbnail
  const getYoutubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : "";
  };

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        // "http://localhost:9004/v1/products/courses/list",
        `${confirm/v1/products/courses/list",

        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (result.status === 1 && result.data) {
        setCourses(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-pink-700">
        Courses
      </h1>

      {loading ? (
        <div className="text-center text-gray-500">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center text-gray-500">No courses available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-pink-700 mb-2">
                {course.course_name}
              </h2>
              {course.course_link && (
                <a
                  href={course.course_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-2"
                >
                  <img
                    src={getYoutubeThumbnail(course.course_link)}
                    alt={course.course_name}
                    className="rounded w-full"
                  />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
