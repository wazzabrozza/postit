using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Kaban_Whiteboard.Models
{
    public class Columns
    {
        [Key]
        public int Column_Id { get; set; }
        public string Column_Description { get; set; }
        public int Master_Id { get; set; }
        public int Column_Order { get; set; }
    }
}
