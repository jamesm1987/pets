import Loading from "../components/Loading";
import Error from "../components/Error";
import NavLink from "../components/NavLink";
import { useDashboardStats } from "../hooks/useDashboardStats";


function Dashboard() {
    const { data, isLoading, error } = useDashboardStats();

    if ( isLoading ) {
        return <Loading message="Loading dashboard..." />
    }

    if ( error ) {
        return <Error message="Error loading dashboard..." />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Pets Dashboard</h1>
                    <NavLink to="/pets" variant="button">View All Pets</NavLink>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;