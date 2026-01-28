import { Appointment } from "@/domain/entities/Appointment";

enum AppointmentActionVariant {
	Finished = "finished",
	Join = "join",
	Pay = "pay",
	None = "none"
}

const AppointmentActionLabels: Record<AppointmentActionVariant, string> = {
	[AppointmentActionVariant.Finished]: "Finished",
	[AppointmentActionVariant.Join]: "Join Now",
	[AppointmentActionVariant.Pay]: "Pay Now",
	[AppointmentActionVariant.None]: ""
};

export function getAppointmentAction(
	appointment: Appointment,
	isAppointmentPast: (appointment: Appointment) => boolean,
	role?: string
): { label: string; disabled: boolean; variant: string } {
	if (isAppointmentPast(appointment)) {
		return {
			label: AppointmentActionLabels[AppointmentActionVariant.Finished],
			disabled: true,
			variant: AppointmentActionVariant.Finished
		};
	}
	if (role === 'doctor') {
		if (appointment.status === 'accepted') {
			return {
				label: AppointmentActionLabels[AppointmentActionVariant.Join],
				disabled: false,
				variant: AppointmentActionVariant.Join
			};
		}
		return {
			label: '',
			disabled: true,
			variant: AppointmentActionVariant.None
		};
	}
	if (appointment.status === "pending") {
		return {
			label: "Pending",
			disabled: true,
			variant: AppointmentActionVariant.Pay
		};
	}
	if (appointment.status === "rejected") {
		return {
			label: "Declined",
			disabled: true,
			variant: AppointmentActionVariant.None
		};
	}
	if (!appointment.isPaid && appointment.status === "accepted" && role !== 'doctor') {
		return {
			label: AppointmentActionLabels[AppointmentActionVariant.Pay],
			disabled: false,
			variant: AppointmentActionVariant.Pay
		};
	}
	if (appointment.isPaid && appointment.status === "accepted") {
		return {
			label: AppointmentActionLabels[AppointmentActionVariant.Join],
			disabled: false,
			variant: AppointmentActionVariant.Join
		};
	}
	return {
		label: "",
		disabled: true,
		variant: AppointmentActionVariant.None
	};
}
