import React, { useEffect, useState } from "react";

interface Course {
  course_id: number;
  course_name: string;
  course_link: string;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseLink, setNewCourseLink] = useState("");
  const token = "YOUR_BEARER_TOKEN_HERE"; // replace with actual token

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:9004/v1/products/courses/list", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.status === 1 && result.data) {
        setCourses(result.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Add a course
  const addCourse = async () => {
    if (!newCourseName || !newCourseLink) return;

    try {
      const response = await fetch("http://localhost:9004/v1/products/courses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course_name: newCourseName, course_link: newCourseLink }),
      });
      const result = await response.json();
      if (result.course_id) {
        setCourses(prev => [...prev, result]);
        setNewCourseName("");
        setNewCourseLink("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a course
  const deleteCourse = async (course_id: number) => {
    try {
      const response = await fetch(`http://localhost:9004/v1/products/courses/${course_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.status === 1) {
        setCourses(prev => prev.filter(c => c.course_id !== course_id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center text-pink-700">Courses</h1>

      {/* Add course form */}
      <div className="mb-6 flex gap-2 justify-center">
        <input
          type="text"
          placeholder="Course Name"
          value={newCourseName}
          onChange={e => setNewCourseName(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="url"
          placeholder="Course Link"
          value={newCourseLink}
          onChange={e => setNewCourseLink(e.target.value)}
          className="border rounded p-2"
        />
        <button
          onClick={addCourse}
          className="bg-pink-600 text-white px-4 rounded hover:bg-pink-700"
        >
          Add
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center text-gray-500">No courses available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.course_id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative"
            >
              <h2 className="text-xl font-semibold text-pink-700 mb-2">{course.course_name}</h2>
              <a
                href={course.course_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline mb-2 block"
              >
                Watch Course
              </a>
              <button
                onClick={() => deleteCourse(course.course_id)}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
