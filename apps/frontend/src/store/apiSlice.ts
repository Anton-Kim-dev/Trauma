import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { createSession } from "../lib/session";
import type {
  AddUserRequest,
  AppointmentInfo,
  CreateAppointmentRequest,
  DoctorInfo,
  LoginRequest,
  LoginResponse,
  PatientInfo,
  RegisterRequest,
  RegisterResponse,
} from "../types";
import { clearCredentials, setCredentials, type AuthState } from "./authSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

type RootStateWithAuth = {
  auth: AuthState;
};

type RefreshResponse = {
  access_token?: string;
};

type UpdatePatientRequest = {
  birth_date: string;
  email: string;
  first_name: string;
  gender: "M" | "F";
  last_name: string;
  patronymic: string | null;
  phone: string | null;
};

type CompleteAppointmentRequest = {
  appointment_id: string;
  doctor_notes: string;
};

type CancelAppointmentRequest = {
  appointment_id: string;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const session = (getState() as RootStateWithAuth).auth.session;
    headers.set("Content-Type", "application/json");

    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    return headers;
  },
});

const baseQueryWithRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const session = (api.getState() as RootStateWithAuth).auth.session;

  if (result.error?.status === 401 && session?.refreshToken) {
    const refreshResult = await rawBaseQuery(
      {
        body: { token: session.refreshToken },
        method: "POST",
        url: "/auth/refresh",
      },
      api,
      extraOptions,
    );

    const payload = refreshResult.data as RefreshResponse | undefined;
    const nextSession = payload?.access_token ? createSession(payload.access_token, session.refreshToken) : null;

    if (nextSession) {
      api.dispatch(setCredentials(nextSession));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  keepUnusedDataFor: 300,
  refetchOnReconnect: true,
  tagTypes: ["Appointment", "Doctor", "Patient"],
  endpoints: (builder) => ({
    addUser: builder.mutation<{ result: number; userId: string | null }, AddUserRequest>({
      query: (body) => ({
        body,
        method: "POST",
        url: "/auth/admin/add_user",
      }),
      invalidatesTags: ["Doctor", "Patient"],
    }),
    cancelAppointment: builder.mutation<boolean, CancelAppointmentRequest>({
      query: (body) => ({
        body,
        method: "POST",
        url: "/appointments/cancel",
      }),
      invalidatesTags: ["Appointment"],
    }),
    completeAppointment: builder.mutation<AppointmentInfo, CompleteAppointmentRequest>({
      query: (body) => ({
        body,
        method: "POST",
        url: "/appointments/complete",
      }),
      invalidatesTags: ["Appointment"],
    }),
    createAppointment: builder.mutation<AppointmentInfo, CreateAppointmentRequest>({
      query: (body) => ({
        body,
        method: "POST",
        url: "/appointments/create",
      }),
      invalidatesTags: ["Appointment"],
    }),
    getAppointments: builder.query<AppointmentInfo[], void>({
      query: () => "/appointments/get",
      providesTags: (result) =>
        result
          ? [
              ...result.map((appointment) => ({ type: "Appointment" as const, id: appointment.id })),
              { type: "Appointment" as const, id: "LIST" },
            ]
          : [{ type: "Appointment" as const, id: "LIST" }],
    }),
    getDoctors: builder.query<DoctorInfo[], void>({
      query: () => "/users/doctors/get",
      providesTags: (result) =>
        result
          ? [
              ...result.map((doctor) => ({ type: "Doctor" as const, id: doctor.id })),
              { type: "Doctor" as const, id: "LIST" },
            ]
          : [{ type: "Doctor" as const, id: "LIST" }],
    }),
    getPatientInfo: builder.query<PatientInfo, string>({
      query: (userId) => `/users/patients/info?id=${encodeURIComponent(userId)}`,
      providesTags: (result, _error, userId) => [
        { type: "Patient" as const, id: userId },
        ...(result ? [{ type: "Patient" as const, id: result.id }] : []),
      ],
    }),
    getPatients: builder.query<PatientInfo[], void>({
      query: () => "/users/patients/get",
      providesTags: (result) =>
        result
          ? [
              ...result.map((patient) => ({ type: "Patient" as const, id: patient.id })),
              { type: "Patient" as const, id: "LIST" },
            ]
          : [{ type: "Patient" as const, id: "LIST" }],
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        body,
        method: "POST",
        url: "/auth/login",
      }),
    }),
    logout: builder.mutation<void, { token: string }>({
      query: (body) => ({
        body,
        method: "POST",
        url: "/auth/logout",
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        body,
        method: "POST",
        url: "/auth/register",
      }),
    }),
    updatePatient: builder.mutation<PatientInfo, UpdatePatientRequest>({
      query: (body) => ({
        body,
        method: "POST",
        url: "/users/patients/update",
      }),
      invalidatesTags: (result) => [
        { type: "Patient" as const, id: "LIST" },
        ...(result ? [{ type: "Patient" as const, id: result.id }, { type: "Patient" as const, id: result.user_id }] : []),
      ],
    }),
  }),
});

export const {
  useAddUserMutation,
  useCancelAppointmentMutation,
  useCompleteAppointmentMutation,
  useCreateAppointmentMutation,
  useGetAppointmentsQuery,
  useGetDoctorsQuery,
  useGetPatientInfoQuery,
  useGetPatientsQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdatePatientMutation,
} = apiSlice;
