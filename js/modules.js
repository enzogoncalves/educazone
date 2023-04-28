
export default function getUserData(snapshot, userUid) {
	let userData

	for (const i in snapshot) {
		for (const j in snapshot[i]) {
			if (j === userUid) userData = snapshot[i][j]
		}
	}

	return userData
}
