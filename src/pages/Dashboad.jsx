import { useState } from "react";
import BotBuilder from "./BotBuilder";
import BotManager from "./BotManager";

function Dasboard(){

    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('dashboard')

    const [selectedBotId, setSelectedBotId] = useState(null);

    const handleConfigureBot = (botId) => {
        setSelectedBotId(botId);
        setActiveTab('crear-bot');
    }

    function renderContent(){
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div>
                        Mi Dashboard
                    </div>
                );
            case 'mis-bots':
                return <BotManager onConfigure={handleConfigureBot} />
            case 'crear-bot':
                return <BotBuilder botId={selectedBotId}></BotBuilder>
        
            default:
                break;
        }
    }
    

    return (
        <>
            <div className="flex h-screen bg-gray-50 font-sans">

                <div className={`fixed inset-0 z-40 md:hidden transition-opacity ${isSidebarOpen?"opacity-100":"opacity-0 pointer-events-none"}`}>
                    <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setSidebarOpen(false)}></div>
                </div>

                <aside className={`fixed inset-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen?'translate-x-0':'-translate-x-full'} `}>
                    <div className="p-6 text-xl text-indigo-400">SIDEBAR CHATBOT</div>
                    <nav className="mt-4 px-4 space-y-2">
                        <button
                        onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false) }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl bg-indigo-600 hover:bg-slate-800`}>
                            INICIO
                        </button>
                        <button
                            onClick={() => {setActiveTab('mis-bots'); setSidebarOpen(false) }}
                            className={`w-full flex items-center p-3 space-x-3 rounded-xl text-slate-400 hover:bg-slate-800`}>
                            MIS CHATBOTS
                        </button>
                    </nav>
                </aside>

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <header className="flex items-center justify-between h-16 bg-white border-b px-6">
                        <button className="md:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                            <span className="text-2xl">☰</span>
                        </button>
                        <div className="flex items-center gap-4 ml-auto">
                            <button className="hidden sm:block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">Crear Nuevo Bot</button>
                            <div className="h-8 w-8 rounded-full bg-slate-300"></div>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {renderContent()}
                    </main>
                </div>


            </div>
        </>
    )
}

export default Dasboard;