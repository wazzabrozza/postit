using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Kaban_Whiteboard.Models
{
    public class Master
    {
        [Key]
        public int Bup_Id {get; set;}
        public string Bup_Desc {get; set;}
    }
}

