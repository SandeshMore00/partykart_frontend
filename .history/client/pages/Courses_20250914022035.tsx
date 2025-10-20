import React, { useEffect, useState } from "react";

interface Course {
  course_id: number;
  course_name: string;
  course_price: number;
  course_description: string;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:9012/v1/courses", {
        method: "GET",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setCourses(result.data);
        }
      }
    } catch {
      // Optionally add error handling
    }
    setLoading(false);
  };

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
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-pink-700 mb-2">
                {course.course_name}
              </h2>
              <div className="text-pink-600 font-bold mb-2">
                ₹{course.course_price}
              </div>
              <div className="text-gray-700 mb-2">{course.course_description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
