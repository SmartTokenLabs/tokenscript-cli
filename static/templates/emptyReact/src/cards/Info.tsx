// @ts-nocheck
import React, { useState, useEffect } from "react";
import Loader from "../components/loader/loader";

export const Info: React.FC = ({ token }) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(false);
	}, []);

	return (
		<div>
			{token && <pre>{JSON.stringify(token, null, 2)}</pre>}
			<Loader show={loading} />
		</div>
	);
};
