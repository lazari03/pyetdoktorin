export interface Doctor {
	id: string;
	name: string;
	specialization: string[];
	profilePicture?: string; // URL to DigitalOcean Spaces image
}
