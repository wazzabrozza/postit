using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kaban_Whiteboard.Models;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Kaban_Whiteboard.Controllers
{
    [Route("api/notes")]
    [ApiController]
    public class NotesController : Controller
    {
        private readonly AppDbContext _context;

        public NotesController(AppDbContext context)
        {
            _context = context;
        }

       /* // GET: api/<notes>
        public async Task<IActionResult> Index(string sortOrder)
        {
            ViewData["ColSortParm"] = string.IsNullOrEmpty(sortOrder) ? "postitColId" : "";
            ViewData["OrderSortParm"] = sortOrder == "Order" ? "postit)rder" : "postitorder";
            var notes = from s in _context.Postit
                           select s;
            //switch (sortOrder)
           // {
                //case "postitColId":
                    notes = notes.OrderByDescending(s => s.Postit_Col_Id);
                    //break;
                //case "postitdesc":
                   // notes = notes.OrderBy(s => s.Postit_Desc);
                    //break;
                //case "postitorder":
                    //notes = notes.OrderByDescending(s => s.Postit_Order);
                   // break;
                //default:
                    //notes = notes.OrderBy(s => s.Postit_Col_Id);
                    //break;
           // }
            return View(await notes.AsNoTracking().ToListAsync());
        }*/

        // GET: api/<notes>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Postit>>> GetNotes ()
        {
            return await _context.Postit.ToListAsync();
        }

        // GET api/<controller>/5
        [HttpGet("{Postit_Id}")]
        public async Task<ActionResult<Postit>> GetNote (int Postit_Id)
        {
            var GetPostedNote = await _context.Postit.FindAsync(Postit_Id);

            if (GetPostedNote == null)
            {
                return NotFound();
            }

            return GetPostedNote;
        }

        // POST api/<controller>
        [HttpPost]
        public async Task<ActionResult<Postit>> InsertNote (Postit note)
        {
            _context.Postit.Add(note);
            await _context.SaveChangesAsync();

            return note; //CreatedAtAction(nameof(note), new { Id = note.Postit_Id, }, note);
        }

        // PUT api/<controller>/5
        [HttpPut("{Postit_Id}")]
        public async Task<IActionResult> UpdateNote (int Postit_Id, Postit note)
        {
           if (Postit_Id != note.Postit_Id)
           {
                return BadRequest();
           }

            _context.Entry(note).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpPatch("{Postit_Id}")]
        public async Task<ActionResult> Patch(int Postit_Id, [FromBody] JsonPatchDocument<Postit> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest();
            }

            var authorFromDB = await _context.Postit.FirstOrDefaultAsync(x => x.Postit_Id == Postit_Id);

            if (authorFromDB == null)
            {
                return NotFound();
            }

            patchDoc.ApplyTo(authorFromDB, ModelState);

            var isValid = TryValidateModel(authorFromDB);

            if (!isValid)
            {
                return BadRequest(ModelState);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE api/<controller>/5
        [HttpDelete("{Postit_Id}")]
        public async Task<ActionResult<Postit>> DeleteNote (int Postit_Id)
        {
            var GetPostedNote = await _context.Postit.FindAsync(Postit_Id);

            if (GetPostedNote == null)
            {
                return NotFound();
            }

            _context.Postit.Remove(GetPostedNote);
            await _context.SaveChangesAsync();

            return GetPostedNote;
        }
    }
}
