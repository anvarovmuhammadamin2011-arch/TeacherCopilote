import { Component, Suspense, lazy, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Layout from "@/components/layout/Layout";
import {
  ProtectedRoute,
  PublicRoute,
  HomeRedirect,
} from "@/features/auth/Guards";
import { Loading, Button } from "@/components/common";
const PreparationHub = lazy(
  () => import("@/features/workspace/PreparationHub"),
);
const ClassSchedule = lazy(() => import("@/features/workspace/ClassSchedule"));
const Dashboard = lazy(() => import("@/features/dashboard/Dashboard"));
const Lessons = lazy(() =>
  import("@/features/lessons/Lessons").then((m) => ({ default: m.Lessons })),
);
const LessonDetails = lazy(() =>
  import("@/features/lessons/Lessons").then((m) => ({
    default: m.LessonDetails,
  })),
);
const Quizzes = lazy(() =>
  import("@/features/quizzes/Quizzes").then((m) => ({ default: m.Quizzes })),
);
const QuizCreate = lazy(() =>
  import("@/features/quizzes/Quizzes").then((m) => ({ default: m.QuizCreate })),
);
const ClassDetails = lazy(() =>
  import("@/features/classes/Classes").then((m) => ({
    default: m.ClassDetails,
  })),
);
const Materials = lazy(() => import("@/features/materials/Materials"));
const Profile = lazy(() =>
  import("@/features/account/Account").then((m) => ({ default: m.Profile })),
);
const Settings = lazy(() =>
  import("@/features/account/Account").then((m) => ({ default: m.Settings })),
);
const Documents = lazy(() => import("@/features/documents/Documents"));
const Login = lazy(() =>
  import("@/features/auth/AuthPages").then((m) => ({ default: m.Login })),
);
const ForgotPassword = lazy(() =>
  import("@/features/auth/AuthPages").then((m) => ({
    default: m.ForgotPassword,
  })),
);
const TeacherRegistration = lazy(() =>
  import("@/features/onboarding/TeacherRegistration").then((m) => ({
    default: m.TeacherRegistration,
  })),
);
const RegistrationSuccess = lazy(() =>
  import("@/features/onboarding/TeacherRegistration").then((m) => ({
    default: m.RegistrationSuccess,
  })),
);
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="fatal-error">
        <h1>Kutilmagan xatolik</h1>
        <Button onClick={() => location.reload()}>Qayta yuklash</Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function NotFound() {
  return (
    <div className="not-found">
      <h1>404 · Sahifa topilmadi</h1>
      <Button asChild>
        <Link to="/">Bosh sahifaga qaytish</Link>
      </Button>
    </div>
  );
}
const client = new QueryClient();
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/register"
                  element={<Navigate replace to="/register/teacher" />}
                />
                <Route
                  path="/register/teacher"
                  element={<TeacherRegistration />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/register/success"
                  element={<RegistrationSuccess />}
                />
                <Route
                  path="/teacher/onboarding"
                  element={<TeacherRegistration />}
                />
                <Route path="/teacher" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="prepare" element={<PreparationHub />} />
                  <Route
                    path="tasks"
                    element={<PreparationHub section="tasks" />}
                  />
                  <Route
                    path="exercises"
                    element={
                      <PreparationHub section="tasks" initialView="exercise" />
                    }
                  />
                  <Route
                    path="exercises/:id"
                    element={<Documents kind="exercise" />}
                  />
                  <Route path="lessons" element={<Lessons />} />
                  <Route
                    path="lessons/create"
                    element={<PreparationHub initialView="plan" />}
                  />
                  <Route path="lessons/:id" element={<LessonDetails />} />
                  <Route path="quizzes" element={<Quizzes />} />
                  <Route
                    path="quizzes/create"
                    element={
                      <PreparationHub section="tasks" initialView="test" />
                    }
                  />
                  <Route path="quizzes/:id" element={<QuizCreate />} />
                  <Route
                    path="conspects"
                    element={<PreparationHub initialView="conspect" />}
                  />
                  <Route
                    path="conspects/:id"
                    element={<Documents kind="conspect" />}
                  />
                  <Route
                    path="homework"
                    element={
                      <PreparationHub section="tasks" initialView="homework" />
                    }
                  />
                  <Route
                    path="homework/:id"
                    element={<Documents kind="homework" />}
                  />
                  <Route
                    path="pdf-analyzer"
                    element={<Navigate replace to="/teacher/materials" />}
                  />
                  <Route path="classes" element={<ClassSchedule />} />
                  <Route path="classes/:id" element={<ClassDetails />} />
                  <Route
                    path="calendar"
                    element={
                      <Navigate replace to="/teacher/classes?view=schedule" />
                    }
                  />
                  <Route path="materials" element={<Materials />} />
                  <Route
                    path="ai-assistant"
                    element={<Navigate replace to="/teacher/prepare" />}
                  />
                  <Route
                    path="statistics"
                    element={<Navigate replace to="/teacher" />}
                  />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route
                    path="notifications"
                    element={<Navigate replace to="/teacher" />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
