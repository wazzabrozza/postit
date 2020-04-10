using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Kaban_Whiteboard.Models
{
    public class Postit
    {
        [Key]
        public int Postit_Id { get; set; }
        public int Postit_Order { get; set; }
        public string Postit_Desc { get; set; }
        public Boolean Postit_Locked { get; set; }
        public Boolean Postit_Closed { get; set; }
        public int Postit_Col_Id { get; set; }
        public int Postit_Position_Left { get; set; }
        public int Postit_Position_Top { get; set; }

    }
}
