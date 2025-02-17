import { AbuseUserReports, Users, UserProfiles } from '@/models/index.js';
import { genId } from '@/misc/gen-id.js';
import { getUser } from '../../common/getters.js';
import { ApiError } from '../../error.js';
import define from '../../define.js';
import { createReportAbuseJob } from '@/queue/index.js';

export const meta = {
	tags: ['users'],

	requireCredential: true,

	description: 'File a report.',

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '1acefcb5-0959-43fd-9685-b48305736cb5',
		},

		cannotReportYourself: {
			message: 'Cannot report yourself.',
			code: 'CANNOT_REPORT_YOURSELF',
			id: '1e13149e-b1e8-43cf-902e-c01dbfcb202f',
		},

		cannotReportAdmin: {
			message: 'Cannot report the admin.',
			code: 'CANNOT_REPORT_THE_ADMIN',
			id: '35e166f5-05fb-4f87-a2d5-adb42676d48f',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
		comment: { type: 'string', minLength: 1, maxLength: 2048 },
	},
	required: ['userId', 'comment'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	// Lookup user
	const user = await getUser(ps.userId).catch(e => {
		if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new ApiError(meta.errors.noSuchUser);
		throw e;
	});

	if (user.id === me.id) {
		throw new ApiError(meta.errors.cannotReportYourself);
	}

	if (user.isAdmin) {
		throw new ApiError(meta.errors.cannotReportAdmin);
	}

	const report = await AbuseUserReports.insert({
		id: genId(),
		createdAt: new Date(),
		targetUserId: user.id,
		targetUserHost: user.host,
		reporterId: me.id,
		reporterHost: null,
		comment: ps.comment,
	}).then(x => AbuseUserReports.findOneByOrFail(x.identifiers[0]));

	createReportAbuseJob(report);
});
