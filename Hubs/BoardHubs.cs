using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SignalRWhiteBoard.Hubs
{
    public class BoardHub : Hub
    {
        public Task Draw(int prevX, int prevY, int currentX, int currentY, string color)
        {
            return Clients.Others.SendAsync("draw", prevX, prevY, currentX, currentY, color);
        }
    }
}