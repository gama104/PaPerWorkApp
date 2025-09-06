import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Calendar from "./Calendar";
import TimePicker from "./TimePicker";
import PlaceSelector from "./PlaceSelector";
import SignaturePad from "./SignaturePad";

interface TherapySession {
  fecha: Date | null;
  horario: string;
  lugar: string;
  escuela?: string;
  transportacion: "Sí" | "No";
  firmaPadre: string; // "signature_data" or "Excusado" or "Ausencia Injustificada" or "Asistió"
  firmaFuncionario: string;
}

interface SessionFormData {
  // Header Section
  therapyType: string;
  numeroExpediente: string;

  // Patient Information
  nombrePaciente: string;
  impedimento: string;
  edad: number;
  mes: string;
  año: number;
  privado: boolean;
  planPrivado: boolean;
  remedioProvisional: boolean;
  frecuencia: number;
  duracion: string;
  numeroRegistro: string;
  rp1: string;
  rp2: string;
  rp3: string;
  rp4: string;

  // Therapy Sessions
  sessions: TherapySession[];

  // Footer Section
  observaciones: string;
  fechaEspecialista: Date | null;
  nombreEspecialista: string;
  firmaEspecialista: string;
}

interface SessionFormProps {
  onSubmit: (data: SessionFormData) => void;
  className?: string;
}

const SessionForm: React.FC<SessionFormProps> = ({
  onSubmit,
  className = "",
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<SessionFormData>({
    defaultValues: {
      sessions: [
        {
          fecha: null,
          horario: "",
          lugar: "",
          transportacion: "No",
          firmaPadre: "",
          firmaFuncionario: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  const [especialistaSignature, setEspecialistaSignature] = useState<string>();

  const durations = ["30 min", "45 min", "60 min"];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const schools = [
    "Escuela Primaria Central",
    "Escuela Secundaria Norte",
    "Instituto Tecnológico",
    "Colegio San Juan",
    "Escuela María Montessori",
    "Instituto Bilingüe",
  ];

  const firmaOptions = ["Excusado", "Ausencia Injustificada", "Asistió"];

  const calculateEndTime = (startTime: string, duration: string) => {
    if (!startTime || !duration) return "";

    const [hours, minutes] = startTime.split(":").map(Number);
    const durationMinutes = parseInt(duration.replace(" min", ""));

    const endHours = Math.floor((minutes + durationMinutes) / 60) + hours;
    const endMinutes = (minutes + durationMinutes) % 60;

    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const addSession = () => {
    append({
      fecha: null,
      horario: "",
      lugar: "",
      transportacion: "No",
      firmaPadre: "",
      firmaFuncionario: "",
    });
  };

  const handleEspecialistaSignature = (signatureData: string) => {
    setEspecialistaSignature(signatureData);
    setValue("firmaEspecialista", signatureData);
  };

  const onFormSubmit = (data: SessionFormData) => {
    const formData = {
      ...data,
      firmaEspecialista: especialistaSignature || "",
    };
    onSubmit(formData);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Formulario de Terapia
      </h2>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Información de la Terapia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Therapy Type *
              </label>
              <input
                type="text"
                {...register("therapyType", {
                  required: "Therapy type is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter therapy type"
              />
              {errors.therapyType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.therapyType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Expediente
              </label>
              <input
                type="text"
                {...register("numeroExpediente")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter file number"
              />
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Información del Paciente
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Paciente *
                </label>
                <input
                  type="text"
                  {...register("nombrePaciente", {
                    required: "Patient name is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter patient name"
                />
                {errors.nombrePaciente && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.nombrePaciente.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Impedimento (Condition)
                </label>
                <input
                  type="text"
                  {...register("impedimento")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter condition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  {...register("edad", { min: 0, max: 120 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Age in years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mes *
                </label>
                <select
                  {...register("mes", { required: "Month is required" })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                {errors.mes && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.mes.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año *
                </label>
                <input
                  type="number"
                  {...register("año", {
                    required: "Year is required",
                    min: currentYear,
                    max: currentYear + 5,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Year"
                />
                {errors.año && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.año.message}
                  </p>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="privado"
                  {...register("privado")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="privado"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Privado
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="planPrivado"
                  {...register("planPrivado")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="planPrivado"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Plan Privado
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remedioProvisional"
                  {...register("remedioProvisional")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remedioProvisional"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Remedio Provisional
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frecuencia (per week) *
                </label>
                <input
                  type="number"
                  {...register("frecuencia", {
                    required: "Frequency is required",
                    min: 1,
                    max: 5,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1-5 times per week"
                />
                {errors.frecuencia && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.frecuencia.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duración *
                </label>
                <select
                  {...register("duracion", {
                    required: "Duration is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select duration</option>
                  {durations.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
                {errors.duracion && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.duracion.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Registro
                </label>
                <input
                  type="text"
                  {...register("numeroRegistro")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Registration number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RP (Referral #)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register("rp1")}
                    maxLength={2}
                    className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    placeholder="__"
                  />
                  <span className="self-center text-gray-500">-</span>
                  <input
                    type="text"
                    {...register("rp2")}
                    maxLength={2}
                    className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    placeholder="__"
                  />
                  <span className="self-center text-gray-500">-</span>
                  <input
                    type="text"
                    {...register("rp3")}
                    maxLength={2}
                    className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    placeholder="__"
                  />
                  <span className="self-center text-gray-500">-</span>
                  <input
                    type="text"
                    {...register("rp4")}
                    maxLength={2}
                    className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    placeholder="__"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Therapy Sessions */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sesiones de Terapia
            </h3>
            <button
              type="button"
              onClick={addSession}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              + Add Session
            </button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                  Session {index + 1}
                </h4>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    {...register(`sessions.${index}.fecha` as const)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horario
                  </label>
                  <TimePicker
                    selectedTime={watch(`sessions.${index}.horario`)}
                    onTimeSelect={(time) =>
                      setValue(`sessions.${index}.horario`, time)
                    }
                  />
                  {watch(`sessions.${index}.horario`) && watch("duracion") && (
                    <p className="text-xs text-gray-500 mt-1">
                      End time:{" "}
                      {calculateEndTime(
                        watch(`sessions.${index}.horario`),
                        watch("duracion")
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lugar
                  </label>
                  <select
                    {...register(`sessions.${index}.lugar` as const)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select location</option>
                    <option value="Centro">Centro</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Escuela">Escuela</option>
                  </select>
                </div>

                {watch(`sessions.${index}.lugar`) === "Escuela" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      School
                    </label>
                    <select
                      {...register(`sessions.${index}.escuela` as const)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select school</option>
                      {schools.map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transportación
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Sí"
                        {...register(
                          `sessions.${index}.transportacion` as const
                        )}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Sí
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="No"
                        {...register(
                          `sessions.${index}.transportacion` as const
                        )}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        No
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Firma Padre o Madre
                  </label>
                  <select
                    {...register(`sessions.${index}.firmaPadre` as const)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select status</option>
                    {firmaOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Padre o Funcionario que Certifica
                  </label>
                  <input
                    type="text"
                    {...register(`sessions.${index}.firmaFuncionario` as const)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Name or signature"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Información del Especialista
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observaciones
              </label>
              <textarea
                {...register("observaciones")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter observations..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha (Especialista)
                </label>
                <input
                  type="date"
                  {...register("fechaEspecialista")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Especialista
                </label>
                <input
                  type="text"
                  {...register("nombreEspecialista")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Specialist name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Guardar Formulario
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionForm;
