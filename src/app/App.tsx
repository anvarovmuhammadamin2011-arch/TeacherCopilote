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
const Dashboard = lazy(() => import("@/features/dashboard/Dashboard"));
const Lessons = lazy(() =>
  import("@/features/lessons/Lessons").then((m) => ({ default: m.Lessons })),
);
const LessonCreate = lazy(() =>
  import("@/features/lessons/Lessons").then((m) => ({
    default: m.LessonCreate,
  })),
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
const Classes = lazy(() =>
  import("@/features/classes/Classes").then((m) => ({ default: m.Classes })),
);
const ClassDetails = lazy(() =>
  import("@/features/classes/Classes").then((m) => ({
    default: m.ClassDetails,
  })),
);
const Documents = lazy(() => import("@/features/documents/Documents"));
const PDFAnalyzer = lazy(() => import("@/features/documents/PDFAnalyzer"));
const Statistics = lazy(() => import("@/features/dashboard/Statistics"));
const Calendar = lazy(() => import("@/features/calendar/Calendar"));
const Materials = lazy(() => import("@/features/materials/Materials"));
const Assistant = lazy(() => import("@/features/ai-assistant/Assistant"));
const Profile = lazy(() =>
  import("@/features/account/Account").then((m) => ({ default: m.Profile })),
);
const Settings = lazy(() =>
  import("@/features/account/Account").then((m) => ({ default: m.Settings })),
);
const Notifications = lazy(() =>
  import("@/features/account/Account").then((m) => ({
    default: m.Notifications,
  })),
);
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
                  <Route path="lessons" element={<Lessons />} />
                  <Route path="lessons/create" element={<LessonCreate />} />
                  <Route path="lessons/:id" element={<LessonDetails />} />
                  <Route path="quizzes" element={<Quizzes />} />
                  <Route path="quizzes/create" element={<QuizCreate />} />
                  <Route path="quizzes/:id" element={<QuizCreate />} />
                  <Route
                    path="conspects"
                    element={<Documents kind="conspect" />}
                  />
                  <Route
                    path="conspects/:id"
                    element={<Documents kind="conspect" />}
                  />
                  <Route
                    path="homework"
                    element={<Documents kind="homework" />}
                  />
                  <Route
                    path="homework/:id"
                    element={<Documents kind="homework" />}
                  />
                  <Route path="pdf-analyzer" element={<PDFAnalyzer />} />
                  <Route path="classes" element={<Classes />} />
                  <Route path="classes/:id" element={<ClassDetails />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="materials" element={<Materials />} />
                  <Route path="ai-assistant" element={<Assistant />} />
                  <Route path="statistics" element={<Statistics />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="notifications" element={<Notifications />} />
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
