"use client";
import { useState, useEffect } from "react";
import { addDays, format, startOfWeek, parse } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Result, Teacher } from "@/lib/types";

interface Lesson {
  teacherCodes?: string[];
  dates: string[];
  classCodes: string[];
  courseRef?: string;
  roomCodes?: string[];
  courseTitle?: string;
  changes?: {
    reasonType: string;
  };
}

interface ScheduleData {
  result: Result;
}

function filterLessonsByTeacher(lessons: Lesson[], teacherCode: string) {
  return lessons.filter(
    (lesson) =>
      lesson.teacherCodes?.includes(teacherCode) &&
      lesson.changes?.reasonType !== "classAbsence"
  );
}

function filterLessonsByDate(lessons: Lesson[], date: string): Lesson[] {
  return lessons.filter((lesson) => lesson.dates.includes(date));
}

export default function Home() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherTag, setTeacherTag] = useState("REIC");
  const [day, setDay] = useState("20241029");

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          "https://davinci.bbs-ehs-trier.de/daVinciIS.dll?content=json"
        );
        if (!response.ok) {
          if (response.status === 429 && retryCount < 5) {
            const retryAfter = Math.pow(2, retryCount) * 1000; // Exponential backoff
            setTimeout(() => fetchData(retryCount + 1), retryAfter);
            return;
          }
          throw new Error("Failed to fetch schedule data");
        }
        const jsonData: ScheduleData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-6 bg-red-50 rounded-lg max-w-md">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h2 className="text-lg font-semibold text-red-700">
            Error Loading Schedule
          </h2>
          <p className="text-red-600">
            {error || "Failed to load schedule data"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const myLessons = filterLessonsByTeacher(
    data.result.displaySchedule.lessonTimes,
    teacherTag
  );

  const parsedDay = parse(day, "yyyyMMdd", new Date());
  const startOfWeekDate = startOfWeek(parsedDay, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    date: format(addDays(startOfWeekDate, i), "yyyyMMdd"),
    dayName: format(addDays(startOfWeekDate, i), "EEE"),
    displayDate: format(addDays(startOfWeekDate, i), "d MMM"),
    isToday:
      format(new Date(), "yyyyMMdd") ===
      format(addDays(startOfWeekDate, i), "yyyyMMdd"),
  }));

  const myWeek = weekDays.map(({ date, dayName, displayDate, isToday }) => ({
    date,
    dayName,
    displayDate,
    isToday,
    lessons: filterLessonsByDate(myLessons, date),
  }));

  const handleTeacherChange = (newTeacherTag: string) => {
    setTeacherTag(newTeacherTag);
  };

  const handleWeekChange = (direction: "previous" | "next") => {
    const newDay = format(
      addDays(parsedDay, direction === "previous" ? -7 : 7),
      "yyyyMMdd"
    );
    setDay(newDay);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg shadow gap-4">
        <div className="space-x-2">
          <Select onValueChange={(e)=>console.log(e)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {data.result.teachers.map((teacher: Teacher) => (
                <SelectItem key={teacher.id} value={teacher.code}>
                  {teacher.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => handleTeacherChange("REIC")}
            className={`px-4 py-2 rounded-md transition-colors ${
              teacherTag === "REIC"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            REIC
          </button>
          <button
            onClick={() => handleTeacherChange("SCHL")}
            className={`px-4 py-2 rounded-md transition-colors ${
              teacherTag === "SCHL"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            SCHL
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleWeekChange("previous")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-gray-700 min-w-32 text-center">
            {format(startOfWeekDate, "MMMM yyyy")}
          </span>
          <button
            onClick={() => handleWeekChange("next")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
        {myWeek.map(({ date, dayName, displayDate, isToday, lessons }) => (
          <div
            key={date}
            className={`bg-white rounded-lg shadow p-4 min-h-64 ${
              isToday ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div
              className={`text-center border-b pb-2 mb-3 ${
                isToday ? "border-blue-200" : "border-gray-200"
              }`}
            >
              <div className="text-sm font-medium text-gray-500">{dayName}</div>
              <div
                className={`text-lg font-semibold ${
                  isToday ? "text-blue-600" : ""
                }`}
              >
                {displayDate}
              </div>
            </div>
            <div className="space-y-2">
              {lessons.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-4">
                  No lessons scheduled
                </div>
              ) : (
                lessons.map((lesson) => (
                  <div
                    key={lesson.classCodes[0] + lesson.courseRef}
                    className="bg-blue-50 p-3 rounded-md text-sm space-y-1 hover:bg-blue-100 transition-colors"
                  >
                    <div className="font-medium text-blue-900">
                      {lesson.classCodes[0]}
                    </div>
                    {lesson.courseTitle && (
                      <div className="text-blue-700">{lesson.courseTitle}</div>
                    )}
                    {lesson.roomCodes && lesson.roomCodes.length > 0 && (
                      <div className="text-blue-600 text-xs">
                        Room: {lesson.roomCodes.join(", ")}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
