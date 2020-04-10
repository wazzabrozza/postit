using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kaban_Whiteboard.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Kaban_Whiteboard.Controllers
{
    [ApiController]

    [Route("api/process")]

    public class MasterController : Controller
    {
        private readonly AppDbContext _context;

        public MasterController(AppDbContext context)
        {
            _context = context;
        }
        // GET: api/<process>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Master>>> GetMaster()
        {
            return await _context.BupMaster.ToListAsync();
        }

        // GET api/<controller>/5
        [HttpGet("{Bup_Id}")]
        public async Task<ActionResult<Master>> GetMaster(int Bup_Id)
        {
            var GetMasterId = await _context.BupMaster.FindAsync(Bup_Id);

            if (GetMasterId == null)
            {
                return NotFound();
            }

            return GetMasterId;
        }

        // POST api/<controller>
        [HttpPost]
        public async Task<ActionResult<Master>> InsertMaster(Master program)
        {
            _context.BupMaster.Add(program);
            await _context.SaveChangesAsync();

            return program; // CreatedAtAction(nameof(program), new { id = program.Bup_Id, desc = program.Bup_Desc }, program);
        }

        // PUT api/<controller>/5
        [HttpPut("{Bup_Id}")]
        public async Task<IActionResult> UpdateMaster(int Bup_Id, Master program)
        {
            if (Bup_Id != program.Bup_Id)
            {
                return BadRequest();
            }

            _context.Entry(program).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE api/<controller>/5
        [HttpDelete("{Bup_Id}")]
        public async Task<ActionResult<Master>> DeleteMaster(int Bup_Id)
        {
            var GetMasterId = await _context.BupMaster.FindAsync(Bup_Id);

            if (GetMasterId == null)
            {
                return NotFound();
            }

            _context.BupMaster.Remove(GetMasterId);
            await _context.SaveChangesAsync();

            return GetMasterId;
        }
    }
}