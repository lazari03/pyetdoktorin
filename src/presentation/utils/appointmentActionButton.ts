import { Appointment } from "@/domain/entities/Appointment";
import { UserRole } from "@/domain/entities/UserRole";
import { AppointmentActionKey } from "@/domain/entities/AppointmentAction";

enum AppointmentActionVariant {
	Finished = "finished",
	Join = "join",
	Pay = "pay",
	None = "none"
}

const AppointmentActionLabels: Record<AppointmentActionVariant, string> = {
	[AppointmentActionVariant.Finished]: AppointmentActionKey.Completed,
	[AppointmentActionVariant.Join]: AppointmentActionKey.JoinNow,
	[AppointmentActionVariant.Pay]: AppointmentActionKey.PayNow,
	[AppointmentActionVariant.None]: AppointmentActionKey.None
};

export function getAppointmentAction(
	appointment: Appointment,
	isAppointmentPast: (appointment: Appointment) => boolean,
	role?: UserRole
): { label: string; disabled: boolean; variant: string } {
	if (isAppointmentPast(appointment)) {
		return {
			label: AppointmentActionLabels[AppointmentActionVariant.Finished],
			disabled: true,
			variant: AppointmentActionVariant.Finished
		};
	}
	if (role === UserRole.Doctor) {
		if (appointment.isPaid) {
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
			label: AppointmentActionKey.Pending,
			disabled: true,
			variant: AppointmentActionVariant.Pay
		};
	}
	if (appointment.status === "rejected") {
		return {
			label: AppointmentActionKey.Declined,
			disabled: true,
			variant: AppointmentActionVariant.None
		};
	}
	if (!appointment.isPaid && appointment.status === "accepted") {
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
